import ArticlePage from './components/ArticlePage.jsx'

export default function App() {
  return (
    <ArticlePage
      concepts={['Social cognition', 'Interpersonal guilt', 'fMRI']}
      versionConfig={{
        _v: 3,
        label: 'Version of Record',
        date: '2026-03-24',
        doi: '10.7554/eLife.105391.3',
        status: 'Declared as Version of Record',
      }}
    />
  )
}
