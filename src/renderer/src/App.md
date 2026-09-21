# `App.jsx` Explaination

## Structure

### 0. Import

1. css (app.css)
2. React
   1. useState
   2. useEffort
   3. useRef
3. `Helper.js`
   1. `formatTime(ms)`
   2. `calculateAo5(score)`
   3. `scramble(length=5)`

### 1. Database Operation

1. Get the saved results
```js
const fetchScores = async () => {
   try {
      setLoading(true)
      const data = await window.api.getHighScores(0)
      setScoresList(data)
   } catch (err) {
      console.error('Fail to get the results:', err)
   } finally {
      setLoading(false)
   }
}
useEffect(() => {
   fetchScores()
}, [])
```

2. Add new result
```js
const handleAddScore = async (newRecord) => {
   try {
      await window.api.addScores([newRecord])
      await fetchScores()
      return { success: true }
   } catch (err) {
      console.error('Fail to add the result:', err)
   return { success: false, error: err }
   }
}
```

### 2. Timer

1. 使用 ref 实时同步最新的状态，解决闭包陷阱
2. 监听键盘事件，控制计时器的开始、停止和重置
3. 处理定时器累加

---

## Appendix

### 1. What is `useState, useEffort, useRef` ?

| Hook        | Main purpose                                          | Think of it as         |
| ----------- | ----------------------------------------------------- | ---------------------- |
| `useState`  | Store data that can change                            | 🧠 Component's memory   |
| `useEffect` | Do something after rendering / when data changes      | ⚡ Side effect          |
| `useRef`    | Keep a value or reference without causing a re-render | 📌 Persistent reference |

#### useEffort - 副作用

> Do something because of a **change**

1. Run after every render
   ```js
      useEffect(() => {
         console.log("rendered");
      });
   ```
2. Run once when the component starts
   ```js
      useEffect(() => {
         console.log("component started");
      }, []);
   ```
3. Run when a variable changes
   ```js
      useEffect(() => {
         console.log("count changed");
      }, [count]);
   ```

#### useRef - 别动UI

> Remember something without re-rendering
> This value is useful to my code, but it doesn't describe what the user should see.

```js
function App() {
  const count = useRef(0);

  function handleClick() {
    count.current += 1;
    console.log(count.current);
  }

  return <button onClick={handleClick}>Click</button>;
}
```

The main different form `useState`: 
Changing `.current` does NOT cause React to re-render.
