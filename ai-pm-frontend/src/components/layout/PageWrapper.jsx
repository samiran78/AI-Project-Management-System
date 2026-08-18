import Sidebar from './Sidebar';

/*
  ─── WHY I TOUCHED PageWrapper ────────────────────────────────────────────────
  The outer wrapper is `display:flex`. The inner content div had `flex:1` but
  no `minWidth:0`. In CSS flex, items don't shrink below their content width
  by default — so when the Kanban grid inside had wide content, it would push
  the whole layout wider than the viewport instead of staying contained.

  I did this coz `minWidth:0` on a flex child tells it "yes you CAN shrink
  smaller than your content — the grid inside will handle its own overflow."
  This is the classic flex+grid nesting fix that almost nobody remembers until
  they hit this exact overflow bug.

  The `overflow: hidden` on the content area also stops any stray wide element
  from creating a horizontal scrollbar on the whole page (which looked broken).
  ──────────────────────────────────────────────────────────────────────────────
*/
function PageWrapper({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          /*
            i did this coz without minWidth:0, a flex child refuses to shrink
            below its intrinsic content width. The CSS Grid inside Kanban was
            getting wider than available space because the wrapper let it.
            minWidth:0 gives permission to shrink → grid then does its auto-fill
            magic correctly at every screen width.
          */
          padding: '30px',
          minHeight: '100vh',
          color: '#fff',
          overflowX: 'hidden',
          /*
            i did this coz overflow:hidden prevents any rogue wide child
            (like a pre tag or an unwrapped long string) from creating a
            body-level horizontal scroll — which looked like the whole layout broke.
          */
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default PageWrapper;