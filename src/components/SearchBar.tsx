interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <div className="search-bar__inner">
        <input
          type="text"
          className="search-bar__input"
          placeholder="모든 도구 검색 (예: 사진대지, 검측, KCS, 레미탈, 실정보고)"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label="전체 도구 검색"
        />
      </div>
    </div>
  )
}

export default SearchBar
