
/*const person = {
    name: 'Bruce Wayne',
    age: 36,
    location: 'Gotham City'
}

const {name, age, location} = person;

console.log(name) Bruce Wayne */

const Search = ({searchTerm, setSearchTerm}) => {
    return (
        <div className="search">
            <div>
                <img src="/public/search.svg" alt="Search" />

                <input 
                    type="text" 
                    placeholder="Search for movies..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

    );
}

export default Search;