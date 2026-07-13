package middleware

import (
	"log"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

type LimiterMiddleware struct {
	buckets        map[string]*TokenBucket
	mutex          sync.Mutex
	logger         *log.Logger
	capacity       int
	refillRate     int
	refillInterval time.Duration
}

type TokenBucket struct {
	capacity       int
	refillRate     int
	refillInterval time.Duration
	tokens         int
	lastRefillTime time.Time
	mutex          sync.Mutex
	lastSeen       time.Time
}

func NewLimiterMiddleware(logger *log.Logger, capacity int, refillRate int, refillInterval time.Duration) *LimiterMiddleware {
	return &LimiterMiddleware{
		buckets:        make(map[string]*TokenBucket),
		mutex:          sync.Mutex{},
		logger:         logger,
		capacity:       capacity,
		refillRate:     refillRate,
		refillInterval: refillInterval,
	}
}

func (l *LimiterMiddleware) Allow(key string) (bool, int, int, int) {
	l.mutex.Lock()
	tb, ok := l.buckets[key]
	if !ok {
		tb = NewTokenBucket(l.capacity, l.refillRate, l.refillInterval)
		l.buckets[key] = tb
	}
	tb.lastSeen = time.Now()
	l.mutex.Unlock()

	allowed := tb.Take(1)
	if !allowed {
		l.logger.Printf("Rate Limit: Exceeded for %v\n", key)
	}
	remaining, limit, retryAfter := tb.Snapshot()
	return allowed, remaining, limit, retryAfter
}

func NewTokenBucket(capacity int, refillRate int, refillInterval time.Duration) *TokenBucket {
	t := time.Now()
	return &TokenBucket{
		capacity:       capacity,
		refillRate:     refillRate,
		refillInterval: refillInterval,
		tokens:         capacity,
		lastRefillTime: t,
		lastSeen:       t,
	}
}

func (tb *TokenBucket) refill() {
	current := time.Now()
	elapsed := current.Sub(tb.lastRefillTime)

	intervals := int(elapsed / tb.refillInterval)
	if intervals <= 0 {
		return
	}

	tokensToAdd := intervals * tb.refillRate

	tb.tokens = min(tb.tokens+tokensToAdd, tb.capacity)

	tb.lastRefillTime = tb.lastRefillTime.Add(time.Duration(intervals) * time.Second)
}

func (tb *TokenBucket) Take(tokensRequested int) bool {
	tb.mutex.Lock()
	defer tb.mutex.Unlock()

	tb.refill()

	if tokensRequested <= tb.tokens {
		tb.tokens -= tokensRequested
		return true
	}

	return false
}

func (tb *TokenBucket) Snapshot() (remaining int, limit int, retryAfter int) {
	tb.mutex.Lock()
	defer tb.mutex.Unlock()

	limit = tb.capacity
	remaining = tb.tokens

	if remaining > 0 {
		return remaining, limit, 0
	}

	nextRefill := tb.lastRefillTime.Add(tb.refillInterval)
	timeToWait := time.Until(nextRefill)

	if timeToWait > 0 {
		retryAfter = int(timeToWait.Seconds())
		if retryAfter == 0 {
			retryAfter = 1
		}
	}

	return remaining, limit, retryAfter
}

func extractClientIP(r *http.Request) string {

	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}

	if xrip := r.Header.Get("X-Real-IP"); xrip != "" {
		return strings.TrimSpace(xrip)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)

	if err == nil {
		return host
	}

	return r.RemoteAddr
}

func (l *LimiterMiddleware) StartCleanUp(idleTTL, interval time.Duration) {
	go func() {
		l.logger.Println("Starting Rate Limiter cleanup")
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for range ticker.C {
			current := time.Now()
			l.mutex.Lock()
			for key, tb := range l.buckets {
				if current.Sub(tb.lastSeen) > idleTTL {
					delete(l.buckets, key)
				}
			}
			l.mutex.Unlock()
		}
	}()
}

func (limiter *LimiterMiddleware) RateLimiterMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := extractClientIP(r)

		allowed, remaining, limit, retryAfter := limiter.Allow(key)

		w.Header().Set("X-RateLimit-Limit", strconv.Itoa(limit))
		w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(remaining))

		if !allowed {
			if retryAfter > 0 {
				w.Header().Set("Retry-After", strconv.Itoa(retryAfter))
			}
			w.WriteHeader(http.StatusTooManyRequests)
			_, err := w.Write([]byte("Too Many Requests\n"))
			if err != nil {
				log.Fatal(err.Error())
			}
			return
		}
		next.ServeHTTP(w, r)

	})
}
