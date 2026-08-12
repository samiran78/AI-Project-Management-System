import Sidebar from './Sidebar';

function PageWrapper({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '30px', background: '#f5f6fa', minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
}

export default PageWrapper;