const Status = {
  PENDING: 'PENDING',
  RESOLVE: 'RESOLVE',
  REJECT: 'REJECT',
}

// 观察者
class Observer {
  constructor(callback) {
    this.value = '';
    this.status = Status.PENDING;
    this.succList = []; // resolve 回调函数队列
    this.failList = []; // reject 回调函数队列

    try {
      // 执行 callback，执行 then
      console.log('callback = ', callback.toString());
      callback(this.resolve);
    } catch (e) {
      this.reject(e);
    }
  }

  // observer：监听器，status 变化后执行
  then = (succObserver, failObserver) => {
    console.log('依赖收集阶段');
    succObserver = typeof succObserver === 'function' ? succObserver : val => val;
    failObserver = typeof failObserver === 'function' ? failObserver : reason => reason;

    // 保险策略，防止传入同步函数
    if (this.status === Status.RESOLVE) {
      // TODO 执行 resolve
      console.log('执行RESOLVE');
      succObserver(this.value);
    }
    if (this.status === Status.REJECT) {
      // TODO 执行 reject
      console.log('执行REJECT');
      console.log('failObserver = ', failObserver.toString());
      failObserver(this.value);
    }
    if (this.status === Status.PENDING) {
      // 判断是否 push ，push 进哪里（依赖收集）
      console.log('挂载阶段：', succObserver);
      this.succList.push(succObserver);
      this.failList.push(failObserver);
    }
  }

  resolve = (value) => {
    this.status = Status.RESOLVE;
    this.value = value;
    this.succList.forEach(thenFunc => thenFunc(value));
  }

  reject = (reason) => {
    this.status = Status.REJECT;
    this.value = reason;
    this.failList.forEach(thenFunc => thenFunc(reason));
  }
}

// const observer = new Observer((res, rej) => {
//   rej('error: hello wrold');
// })
// observer.then(res => {
//   console.log(res);
// })

const observer = new Observer((res, rej) => {
  // setTimeout(() => {
  res('error: hello wrold');
  // }, 1000)
})

observer.then(res => {
  console.log('回调结束，打印结果');
  console.log(res);
})

// const observer = new Observer((res, rej) => {
//   res('success: hello wrold');
// })

// setTimeout(() => {
//   observer.then((res) => {
//     console.log(res);
//   }, (rej) => {
//     console.log(rej);
//   });
// }, 1000)

// const observer_beta = new Promise((res, rej) => {
//   res('error: hello wrold');
// })
// observer_beta.then((res) => {
//   console.log('success1: ', res);
// })
// observer_beta.then((res) => {
//   console.log('success2: ', res);
// })
// setTimeout(() => {
//   observer_beta.then((res) => {
//     console.log('success: ', res);
//   }).catch((rej) => {
//     console.log(rej);
//   });
// }, 1000)