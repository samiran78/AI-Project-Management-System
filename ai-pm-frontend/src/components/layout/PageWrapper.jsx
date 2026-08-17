import Sidebar from './Sidebar';

function PageWrapper({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '30px', background: 'transparent', minHeight: '100vh', color: '#fff' }}>
        {children}
      </div>
    </div>
  );
}

export default PageWrapper;