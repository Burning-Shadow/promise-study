/*
 * 基于观察者模式实现的 Promise
 */

const STATUS = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
}

class MyPromise {
  constructor(executor) {
    // 存储观察者回调，一旦状态改变则执行回调列表中的函数
    this.resolveObserverArr = [];
    this.rejectObserverArr = [];
    this.status = STATUS.PENDING;
    this.value = undefined;

    const resolve = (val) => {
      if (this.status === STATUS.PENDING) {
        this.resolveObserverArr.forEach(fn => fn(val));
        this.value = val;
        this.status = STATUS.RESOLVED;
      }
    }

    const reject = (reason) => {
      if (this.status === STATUS.PENDING) {
        this.rejectObserverArr.forEach(fn => fn(reason));
        this.value = val;
        this.status = STATUS.REJECTED;
      }
    }

    try {
      executor(resolve);
    } catch (err) {
      reject(err);
    }
  }

  // 兼容 Promise.resolve / Promise.reject 情况，可通过类名直接调用
  static resolve = (p) => {
    if (p instanceof MyPromise) {
      // console.log('instance of MyPromise');
      return p.then();
    }
    // 非 thenable 对象
    if (!p.then) {
      return new MyPromise((resolve, reject) => {
        resolve(p);
      });
    }
    // thenable 对象
    return new MyPromise((resolve, reject) => {
      resolve(p).then();
    });
  }

  static reject = (p) => {
    if (p instanceof MyPromise) {
      return p.catch();
    }
    if (p.then === undefined) {
      return new MyPromise((resolve, reject) => {
        reject(p);
      });
    }
    return new MyPromise((resolve, reject) => {
      reject(p);
    });
  }

  // observer: 分情况讨论，若为具体值则走 resolve，改变状态后抛出，若为 PENDING 状态的异步函数则将值存入回调列表，得到异步结果后再进行调用
  then = (onResolve, onReject) => {
    /*
     * 若传入非函数则包装为函数，通过此种写法可以保证值的透传
     * ---------------------------------------------
     * new Promise(resolve=>resolve(8))
     *  .then()
     *  .catch()
     *  .then(function(value) {
     *    alert(value)
     * })
     * 的行为应该和
     * new Promise(resolve=>resolve(8))
     *  .then(val => val)
     *  .catch(val => val)
     *  .then(function(value) {
     *    alert(value)
     * })
     * 是一样的
     */
    onResolve = typeof onResolve === 'function' ? onResolve : val => val;
    onReject = typeof onReject === 'function' ? onReject : reason => reason;

    return new Promise((resolve, reject) => {
      try {
        if (this.status === STATUS.RESOLVED) {

          const result = onResolve(this.value);
          if (result instanceof MyPromise) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        }

        if (this.status === STATUS.REJECTED) {
          const result = onReject(this.value);
          if (result instanceof MyPromise) {
            result.then(resolve, reject);
          } else {
            reject(result);
          }
        }

        if (this.status === STATUS.PENDING) {
          this.resolveObserverArr.push(val => {
            const result = onResolve(val); // 需要判断一下then接的回调返回的是不是一个MyPromise对象
            if (result instanceof MyPromise) {
              result.then(resolve, reject); // 如果是，直接使用result.then后的结果，毕竟Promise里面就需要这么做
            } else {
              resolve(result);
            }
          });

          this.rejectObserverArr.push(val => {
            const result = onReject(val);
            if (result instanceof MyPromise) {
              result.then(resolve, reject);
            } else {
              reject(result);
            }
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  catch = (onReject) => {
    return this.then(undefined, onReject);
  } finally = (cb) => {
    return this.then(value => {
      cb();
      return value;
    }, err => {
      cb();
      throw err
    });
  }
}

// const p = new MyPromise(resolve => {
//   setTimeout(() => {
//     resolve("hello world");
//   }, 1000);
// });

// p.then(value => {
//   console.log(value);
//   return value + 1;
// }).then(value => {
//   console.log(value);
//   return value + 2
// }).then(value => {
//   console.log(value)
// }).finally((value) => {
//   console.log(value)
// });

let p = MyPromise.resolve(123);
console.log(p);
p.finally(res => console.log(res));