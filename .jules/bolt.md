## 2026-03-06 - [React Context Memoization]
**Learning:** In React applications using Context for state management (like a Cart), failing to memoize the context value object causes all consumer components to re-render whenever the provider's state changes. This is especially impactful in high-traffic contexts used by many layout components (Navbar, Sidebars).
**Action:** Always wrap the context value object in `useMemo` and all provided functions in `useCallback` to ensure stable references and prevent tree-wide re-renders.
