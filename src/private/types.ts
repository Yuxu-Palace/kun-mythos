import { PRIVATE_KEY } from '@/constant/private';

/** 安全的空类型 */
export interface Empty {
  [PRIVATE_KEY]: typeof PRIVATE_KEY;
}
