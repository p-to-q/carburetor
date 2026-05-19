import type { CombustorState, FuelState, RitualState } from '../types.js';

export function createRitualState(): RitualState {
  return {
    stage: 'cold',
    dB_at_ear: 0,
    case_C: 25,
    scent: 'none',
    minutes_runtime_remaining: 0,
    minutes_until_refuel: 0,
    next_user_action: 'pour 5 mL',
  };
}

export function stepRitual(
  fuel: FuelState,
  combustor: CombustorState,
  case_C: number,
): RitualState {
  const burn_mL_per_min = 2.5;
  const minutesRemaining = combustor.running ? fuel.volume_mL / burn_mL_per_min : 0;

  if (fuel.volume_mL <= 0.1) {
    return {
      stage: 'refuel_needed',
      dB_at_ear: 0,
      case_C,
      scent: 'castor',
      minutes_runtime_remaining: 0,
      minutes_until_refuel: 0,
      next_user_action: 'pour 5 mL',
    };
  }

  const stage =
    combustor.phase === 'off'
      ? 'cold'
      : combustor.phase === 'prime'
        ? 'priming'
        : combustor.phase === 'ignite'
          ? 'cranking'
          : combustor.phase === 'warmup'
            ? 'warmup'
            : combustor.phase === 'run'
              ? 'live'
              : 'cooldown';

  const next_user_action =
    stage === 'cold'
      ? 'prime'
      : stage === 'priming'
        ? 'pull crank'
        : stage === 'warmup'
          ? 'wait'
          : combustor.running && minutesRemaining < 1
            ? 'prepare fuel'
            : null;

  return {
    stage,
    dB_at_ear: combustor.exhaust_dB_1m,
    case_C,
    scent: combustor.running || combustor.fuel_consumed_mL > 0 ? 'castor' : 'none',
    minutes_runtime_remaining: minutesRemaining,
    minutes_until_refuel: minutesRemaining,
    next_user_action,
  };
}
