"""small numeric helpers for the python simulator."""


def clamp(value: float, low: float, high: float) -> float:
    return min(high, max(low, value))


def lerp(current: float, target: float, alpha: float) -> float:
    return current + (target - current) * clamp(alpha, 0.0, 1.0)


def seconds_between(prev_t_us: int, next_t_us: int) -> float:
    return max(0.0, (next_t_us - prev_t_us) / 1_000_000)


def round_ties_to_even(value: float) -> int:
    return round(value)
