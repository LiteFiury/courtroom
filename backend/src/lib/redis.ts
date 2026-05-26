import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const TRIAL_STATE_KEY = (trialId: string) => `trial:${trialId}:state`;
export const TRIAL_PHASE_KEY = (trialId: string) => `trial:${trialId}:phase`;
export const TRIAL_LOCK_KEY  = (trialId: string) => `trial:${trialId}:lock`;
