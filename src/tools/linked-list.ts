import { storage } from '@/atomic-functions/data-storage';
import { pick } from '@/atomic-functions/pick';
import { PRIVATE_KEY } from '@/constant/private';
import type { KEqual } from '@/types/base';

interface Node<T = any, M = any> {
  data: T;
  next: NodeOrNull<T, M>;
  prev: NodeOrNull<T, M>;
  metadata: M | undefined;
}

type NodeOrNull<T = any, M = any> = Node<T, M> | null;

/**
 * Creates a new doubly linked list node with the specified data, links, and optional metadata.
 *
 * @param data - The value to store in the node
 * @param next - Reference to the next node or null
 * @param prev - Reference to the previous node or null
 * @param metadata - Optional metadata associated with the node
 * @returns The newly created node object
 */
function createNode<T, M>(
  data: T,
  next: Node<T, M>['next'],
  prev: Node<T, M>['prev'],
  metadata: Node<T, M>['metadata'],
): Node<T, M> {
  return { data, next, prev, metadata: metadata };
}

interface LinkedListSelf<T = any, M = any> extends Iterable<Node<T, M>> {
  /**
   * 头节点
   *
   * 设置头节点时会自动删除 prev
   *
   * 设置为 null 时会清空整个链表
   */
  head: NodeOrNull<T, M>;
  /**
   * 尾节点
   *
   * 设置尾节点时会自动删除 next
   *
   * 设置为 null 时会清空整个链表
   */
  tail: NodeOrNull<T, M>;
  /**
   * 转换为 VO
   */
  tvo: <Flag extends boolean>(
    node: Node,
    needMetadata?: Flag,
  ) => KEqual<Flag, true> extends true ? { data: T; metadata: Node<T, M>['metadata'] } : T;
}

/**
 * Retrieves the internal state object associated with a given `LinkedList` instance.
 *
 * @returns The internal linked list state for the specified `LinkedList`.
 */
function getSelf<T, M>(key: LinkedList<T, M>) {
  return storage.get(key, PRIVATE_KEY) as LinkedListSelf<T, M>;
}

export class LinkedList<T = any, M = any> {
  constructor() {
    // 完全杜绝用户操作 node, 只能通过提供的 api 操作
    storage.set(
      this,
      {
        _head: null,
        _tail: null,

        set head(node) {
          if (!node) {
            // 头节点被设置为 null 则表示清空整个链表
            this._head = null;
            this._tail = null;
            return;
          }
          node.prev = null;
          this._head = node;
        },
        get head() {
          return this._head;
        },
        set tail(node) {
          if (!node) {
            // 尾节点被设置为 null 则表示清空整个链表
            this._head = null;
            this._tail = null;
            return;
          }
          node.next = null;
          this._tail = node;
        },
        get tail() {
          return this._tail;
        },
        *[Symbol.iterator]() {
          let node = this.head;

          while (node) {
            yield node;
            node = node.next;
          }
        },
        tvo(node, needMetadata) {
          if (needMetadata) {
            return pick(node, ['data', 'metadata']);
          } else {
            return node.data;
          }
        },
      } satisfies LinkedListSelf & { _head: NodeOrNull; _tail: NodeOrNull },
      PRIVATE_KEY,
    );
  }

  /**
   * 从可迭代对象创建链表
   */
  static from<T>(init: Iterable<T> | ArrayLike<T> = []) {
    const arr = Array.from(init);
    const list = new LinkedList<T>();
    for (const item of arr) {
      list.push(item);
    }
    return list;
  }

  /**
   * 从可迭代对象创建链表
   */
  static fromEntries<T, M>(init: Iterable<[T, M]> | ArrayLike<[T, M]> = []) {
    const arr = Array.from(init);
    const list = new LinkedList<T, M>();
    for (const [item, metadata] of arr) {
      list.push(item, metadata);
    }
    return list;
  }

  /**
   * 转换为可迭代对象
   */
  *toEntries() {
    const self = getSelf<T, M>(this);
    for (const item of self) {
      const { data, metadata } = self.tvo(item, true);
      yield [data, metadata] as const;
    }
  }

  /**
   * 转换为可迭代对象
   */
  *toValues<F extends boolean>(needMetadata?: F) {
    const self = getSelf<T, M>(this);
    for (const item of self) {
      yield self.tvo<F>(item, needMetadata);
    }
  }

  [Symbol.iterator]() {
    return this.toValues();
  }

  /**
   * 转换为数组
   */
  toArray<F extends boolean>(needMetadata?: F) {
    return Array.from(this.toValues<F>(needMetadata));
  }

  /**
   * 添加节点到末尾
   */
  push(data: T, metadata?: Node<T, M>['metadata']) {
    const self = getSelf(this);

    const node = createNode(data, null, self.tail, metadata);
    if (self.tail) {
      self.tail.next = node;
    } else {
      self.head = node;
    }
    self.tail = node;
  }

  /**
   * 从末尾移除节点
   */
  pop<F extends boolean>(needMetadata?: F) {
    const self = getSelf<T, M>(this);

    if (!self.tail) {
      return undefined;
    }
    try {
      return self.tvo<F>(self.tail, needMetadata);
    } finally {
      // 明确解除对 prev 的引用
      const prev = self.tail.prev;
      self.tail.prev = null;

      self.tail = prev;
    }
  }

  /**
   * 从开头移除节点
   */
  shift<F extends boolean>(needMetadata?: F) {
    const self = getSelf<T, M>(this);
    if (!self.head) {
      return undefined;
    }
    try {
      return self.tvo<F>(self.head, needMetadata);
    } finally {
      // 明确解除对 next 的引用
      const next = self.head.next;
      self.head.next = null;
      self.head = next;
    }
  }

  /**
   * 添加节点到开头
   */
  unshift(data: T, metadata?: Node<T, M>['metadata']) {
    const self = getSelf(this);
    const node = createNode(data, self.head, null, metadata);
    if (self.head) {
      self.head.prev = node;
    } else {
      self.tail = node;
    }
    self.head = node;
  }
}
