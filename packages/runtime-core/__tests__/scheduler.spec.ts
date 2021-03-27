import {
  queueJob,
  nextTick,
  queuePostFlushCb,
  invalidateJob,
  queuePreFlushCb,
  flushPreFlushCbs,
  flushPostFlushCbs
} from '../src/scheduler'

describe('scheduler', () => {
  it('nextTick', async () => {
    const calls: string[] = []
    const dummyThen = Promise.resolve().then()
    const job1 = () => {
      calls.push('job1')
    }
    const job2 = () => {
      calls.push('job2')
    }
    nextTick(job1)
    job2()

    expect(calls.length).toBe(1)
    await dummyThen
    // job1 will be pushed in nextTick
    expect(calls.length).toBe(2)
    expect(calls).toMatchObject(['job2', 'job1'])
  })

  describe('queueJob', () => {
    it('basic usage', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
      }
      const job2 = () => {
        calls.push('job2')
      }
      queueJob(job1)
      queueJob(job2)
      expect(calls).toEqual([])
      await nextTick()
      expect(calls).toEqual(['job1', 'job2'])
    })

    it("should insert jobs in ascending order of job's id when flushing", async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')

        queueJob(job2)
        queueJob(job3)
        queueJob(job4)
      }

      const job2 = () => {
        calls.push('job2')
      }
      job2.id = 10

      const job3 = () => {
        calls.push('job3')
      }
      job3.id = 1

      // job4 gets the Infinity as it's id
      const job4 = () => {
        calls.push('job4')
      }

      queueJob(job1)

      expect(calls).toEqual([])
      await nextTick()
      expect(calls).toEqual(['job1', 'job3', 'job2', 'job4'])
    })

    it('should dedupe queued jobs', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
      }
      const job2 = () => {
        calls.push('job2')
      }
      queueJob(job1)
      queueJob(job2)
      queueJob(job1)
      queueJob(job2)
      expect(calls).toEqual([])
      await nextTick()
      expect(calls).toEqual(['job1', 'job2'])
    })

    it('queueJob while flushing', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
        // job2 will be executed after job1 at the same tick
        queueJob(job2)
      }
      const job2 = () => {
        calls.push('job2')
      }
      queueJob(job1)

      await nextTick()
      expect(calls).toEqual(['job1', 'job2'])
    })
  })

  describe('queuePreFlushCb', () => {
    it('basic usage', async () => {
      const calls: string[] = []
      const cb1 = () => {
        calls.push('cb1')
      }
      const cb2 = () => {
        calls.push('cb2')
      }

      queuePreFlushCb(cb1)
      queuePreFlushCb(cb2)

      expect(calls).toEqual([])
      await nextTick()
      expect(calls).toEqual(['cb1', 'cb2'])
    })

    it('should dedupe queued preFlushCb', async () => {
      const calls: string[] = []
      const cb1 = () => {
        calls.push('cb1')
      }
      const cb2 = () => {
        calls.push('cb2')
      }
      const cb3 = () => {
        calls.push('cb3')
      }

      queuePreFlushCb(cb1)
      queuePreFlushCb(cb2)
      queuePreFlushCb(cb1)
      queuePreFlushCb(cb2)
      queuePreFlushCb(cb3)

      expect(calls).toEqual([])
      await nextTick()
      expect(calls).toEqual(['cb1', 'cb2', 'cb3'])
    })

    it('chained queuePreFlushCb', async () => {
      const calls: string[] = []
      const cb1 = () => {
        calls.push('cb1')
        // cb2 will be executed after cb1 at the same tick
        queuePreFlushCb(cb2)
      }
      const cb2 = () => {
        calls.push('cb2')
      }
      queuePreFlushCb(cb1)

      await nextTick()
      expect(calls).toEqual(['cb1', 'cb2'])
    })
  })

  describe('queueJob w/ queuePreFlushCb', () => {
    it('queueJob inside preFlushCb', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
      }
      const cb1 = () => {
        // queueJob in postFlushCb
        calls.push('cb1')
        queueJob(job1)
      }

      queuePreFlushCb(cb1)
      await nextTick()
      expect(calls).toEqual(['cb1', 'job1'])
    })

    it('queueJob & preFlushCb inside preFlushCb', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
      }
      const cb1 = () => {
        calls.push('cb1')
        queueJob(job1)
        // cb2 should execute before the job
        queuePreFlushCb(cb2)
      }
      const cb2 = () => {
        calls.push('cb2')
      }

      queuePreFlushCb(cb1)
      await nextTick()
      expect(calls).toEqual(['cb1', 'cb2', 'job1'])
    })

    it('preFlushCb inside queueJob', async () => {
      const calls: string[] = []
      const job1 = () => {
        // the only case where a pre-flush cb can be queued inside a job is
        // when updating the props of a child component. This is handled
        // directly inside `updateComponentPreRender` to avoid non atomic
        // cb triggers (#1763)
        queuePreFlushCb(cb1)
        queuePreFlushCb(cb2)
        flushPreFlushCbs(undefined, job1)
        calls.push('job1')
      }
      const cb1 = () => {
        calls.push('cb1')
        // a cb triggers its parent job, which should be skipped
        queueJob(job1)
      }
      const cb2 = () => {
        calls.push('cb2')
      }

      queueJob(job1)
      await nextTick()
      expect(calls).toEqual(['cb1', 'cb2', 'job1'])
    })
  })

  describe('queuePostFlushCb', () => {
    it('basic usage', async () => {
      const calls: string[] = []
      const cb1 = () => {
        calls.push('cb1')
      }
      const cb2 = () => {
        calls.push('cb2')
      }
      const cb3 = () => {
        calls.push('cb3')
      }

      queuePostFlushCb([cb1, cb2])
      queuePostFlushCb(cb3)

      expect(calls).toEqual([])
      await nextTick()
      expect(calls).toEqual(['cb1', 'cb2', 'cb3'])
    })

    it('should dedupe queued postFlushCb', async () => {
      const calls: string[] = []
      const cb1 = () => {
        calls.push('cb1')
      }
      const cb2 = () => {
        calls.push('cb2')
      }
      const cb3 = () => {
        calls.push('cb3')
      }

      queuePostFlushCb([cb1, cb2])
      queuePostFlushCb(cb3)

      queuePostFlushCb([cb1, cb3])
      queuePostFlushCb(cb2)

      expect(calls).toEqual([])
      await nextTick()
      expect(calls).toEqual(['cb1', 'cb2', 'cb3'])
    })

    it('queuePostFlushCb while flushing', async () => {
      const calls: string[] = []
      const cb1 = () => {
        calls.push('cb1')
        // cb2 will be executed after cb1 at the same tick
        queuePostFlushCb(cb2)
      }
      const cb2 = () => {
        calls.push('cb2')
      }
      queuePostFlushCb(cb1)

      await nextTick()
      expect(calls).toEqual(['cb1', 'cb2'])
    })
  })

  describe('queueJob w/ queuePostFlushCb', () => {
    it('queueJob inside postFlushCb', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
      }
      const cb1 = () => {
        // queueJob in postFlushCb
        calls.push('cb1')
        queueJob(job1)
      }

      queuePostFlushCb(cb1)
      await nextTick()
      expect(calls).toEqual(['cb1', 'job1'])
    })

    it('queueJob & postFlushCb inside postFlushCb', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
      }
      const cb1 = () => {
        calls.push('cb1')
        queuePostFlushCb(cb2)
        // job1 will executed before cb2
        // Job has higher priority than postFlushCb
        queueJob(job1)
      }
      const cb2 = () => {
        calls.push('cb2')
      }

      queuePostFlushCb(cb1)
      await nextTick()
      expect(calls).toEqual(['cb1', 'job1', 'cb2'])
    })

    it('postFlushCb inside queueJob', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
        // postFlushCb in queueJob
        queuePostFlushCb(cb1)
      }
      const cb1 = () => {
        calls.push('cb1')
      }

      queueJob(job1)
      await nextTick()
      expect(calls).toEqual(['job1', 'cb1'])
    })

    it('queueJob & postFlushCb inside queueJob', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
        // cb1 will executed after job2
        // Job has higher priority than postFlushCb
        queuePostFlushCb(cb1)
        queueJob(job2)
      }
      const job2 = () => {
        calls.push('job2')
      }
      const cb1 = () => {
        calls.push('cb1')
      }

      queueJob(job1)
      await nextTick()
      expect(calls).toEqual(['job1', 'job2', 'cb1'])
    })

    it('nested queueJob w/ postFlushCb', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')

        queuePostFlushCb(cb1)
        queueJob(job2)
      }
      const job2 = () => {
        calls.push('job2')
        queuePostFlushCb(cb2)
      }
      const cb1 = () => {
        calls.push('cb1')
      }
      const cb2 = () => {
        calls.push('cb2')
      }

      queueJob(job1)
      await nextTick()
      expect(calls).toEqual(['job1', 'job2', 'cb1', 'cb2'])
    })
  })

  test('invalidateJob', async () => {
    const calls: string[] = []
    const job1 = () => {
      calls.push('job1')
      invalidateJob(job2)
      job2()
    }
    const job2 = () => {
      calls.push('job2')
    }
    const job3 = () => {
      calls.push('job3')
    }
    const job4 = () => {
      calls.push('job4')
    }
    // queue all jobs
    queueJob(job1)
    queueJob(job2)
    queueJob(job3)
    queuePostFlushCb(job4)
    expect(calls).toEqual([])
    await nextTick()
    // job2 should be called only once
    expect(calls).toEqual(['job1', 'job2', 'job3', 'job4'])
  })

  test('sort job based on id', async () => {
    const calls: string[] = []
    const job1 = () => calls.push('job1')
    // job1 has no id
    const job2 = () => calls.push('job2')
    job2.id = 2
    const job3 = () => calls.push('job3')
    job3.id = 1

    queueJob(job1)
    queueJob(job2)
    queueJob(job3)
    await nextTick()
    expect(calls).toEqual(['job3', 'job2', 'job1'])
  })

  test('sort SchedulerCbs based on id', async () => {
    const calls: string[] = []
    const cb1 = () => calls.push('cb1')
    // cb1 has no id
    const cb2 = () => calls.push('cb2')
    cb2.id = 2
    const cb3 = () => calls.push('cb3')
    cb3.id = 1

    queuePostFlushCb(cb1)
    queuePostFlushCb(cb2)
    queuePostFlushCb(cb3)
    await nextTick()
    expect(calls).toEqual(['cb3', 'cb2', 'cb1'])
  })

  // #1595
  test('avoid duplicate postFlushCb invocation', async () => {
    const calls: string[] = []
    const cb1 = () => {
      calls.push('cb1')
      queuePostFlushCb(cb2)
    }
    const cb2 = () => {
      calls.push('cb2')
    }
    queuePostFlushCb(cb1)
    queuePostFlushCb(cb2)
    await nextTick()
    expect(calls).toEqual(['cb1', 'cb2'])
  })

  test('nextTick should capture scheduler flush errors', async () => {
    const err = new Error('test')
    queueJob(() => {
      throw err
    })
    try {
      await nextTick()
    } catch (e) {
      expect(e).toBe(err)
    }
    expect(
      `Unhandled error during execution of scheduler flush`
    ).toHaveBeenWarned()

    // this one should no longer error
    await nextTick()
  })

  test('should prevent self-triggering jobs by default', async () => {
    let count = 0
    const job = () => {
      if (count < 3) {
        count++
        queueJob(job)
      }
    }
    queueJob(job)
    await nextTick()
    // only runs once - a job cannot queue itself
    expect(count).toBe(1)
  })

  test('should allow explicitly marked jobs to trigger itself', async () => {
    // normal job
    let count = 0
    const job = () => {
      if (count < 3) {
        count++
        queueJob(job)
      }
    }
    job.allowRecurse = true
    queueJob(job)
    await nextTick()
    expect(count).toBe(3)

    // post cb
    const cb = () => {
      if (count < 5) {
        count++
        queuePostFlushCb(cb)
      }
    }
    cb.allowRecurse = true
    queuePostFlushCb(cb)
    await nextTick()
    expect(count).toBe(5)
  })

  test('should prevent duplicate queue', async () => {
    let count = 0
    const job = () => {
      count++
    }
    job.cb = true
    queueJob(job)
    queueJob(job)
    await nextTick()
    expect(count).toBe(1)
  })

  // #1947 flushPostFlushCbs should handle nested calls
  // e.g. app.mount inside app.mount
  test('flushPostFlushCbs', async () => {
    let count = 0

    const queueAndFlush = (hook: Function) => {
      queuePostFlushCb(hook)
      flushPostFlushCbs()
    }

    queueAndFlush(() => {
      queueAndFlush(() => {
        count++
      })
    })

    await nextTick()
    expect(count).toBe(1)
  })
})
