interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar" id="search">
      <div className="search-bar__inner">
        <label className="search-bar__label" htmlFor="workspace-search">
          전체 도구 검색
        </label>
        <input
          id="workspace-search"
          type="search"
          className="search-bar__input"
          placeholder="사진, 검측, KCS, 레미탈, 실정보고, TBM, CSI"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}

export default SearchBar
