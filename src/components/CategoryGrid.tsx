import { categories } from '../data/tools'

function CategoryGrid() {
  return (
    <section className="categories" id="categories">
      <h2 className="section-title">문서방의 도구 범위</h2>
      <div className="categories__grid">
        {categories.map((category) => (
          <div key={category.id} id={category.id} className="category-card">
            <h3 className="category-card__title">{category.title}</h3>
            <p className="category-card__desc">{category.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CategoryGrid
