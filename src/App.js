import './App.scss';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Main } from './components/Main/Main';
import { MembersProvider } from './context/MembersContext';
import { SpeechesProvider } from './context/SpeechesContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MembersProvider>
        <SpeechesProvider>
          <div className="App">
            <Main />
          </div>
        </SpeechesProvider>
      </MembersProvider>
    </QueryClientProvider>
  );
}

export default App;
