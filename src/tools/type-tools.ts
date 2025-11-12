/**
 * 辅助类型守卫，标记联合类型的不可到达分支。
 *
 * @param _value - 应当永远不会出现的值，用于触发类型检查。
 * @param message - 报错信息，描述当前不受支持的场景。
 */
export function assertNever(_value: never, message = 'value is not never'): never {
  throw new Error(message);
}
