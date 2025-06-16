
import { createRoot } from 'react-dom/client';
import SalesforceComparator from './components/SalesforceComparator';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<SalesforceComparator />);
}
