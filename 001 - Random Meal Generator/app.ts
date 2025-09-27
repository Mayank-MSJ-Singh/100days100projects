interface Meal {
    name: string;
    image: string;
    ingredients: string[];
    recipe: string;
}

const meals: Meal[] = [
    {
        name: "Spaghetti Bolognese",
        image: "image/Spaghetti_Bolognese.png",
        ingredients: [
            "Spaghetti 200 grams",
            "Minced Beef 500 grams",
            "Tomato Sauce 400ml",
            "Onion 1 medium",
            "Garlic 2 cloves"
        ],
        recipe: "Heat a large pot with oil over medium-high heat. Add minced beef and brown well, breaking it up with a spoon. Stir in the chopped onion and garlic, cooking until they become soft and fragrant. Pour in the tomato sauce and bring the mixture to a simmer. Reduce heat to low, cover, and let it cook for at least 30 minutes to let the flavors develop. While the sauce simmers, cook the spaghetti according to the package instructions. Drain the cooked spaghetti and serve the bolognese sauce on top. Garnish with fresh basil or grated cheese, if desired."
    },
    {
        name: "Classic Pancakes",
        image: "image/Classic_Pancakes.png",
        ingredients: [
            "All-purpose flour 1½ cups",
            "Baking powder 3½ teaspoons",
            "Salt 1 teaspoon",
            "White sugar 1 tablespoon",
            "Milk 1¼ cups",
            "Egg 1 large",
            "Butter 3 tablespoons melted"
        ],
        recipe: "In a large bowl, sift together the flour, baking powder, salt, and sugar. In a separate bowl, whisk together the milk, egg, and melted butter. Pour the liquid mixture into the dry ingredients and stir until just combined. A few lumps are fine. Do not overmix. Heat a lightly oiled griddle or frying pan over medium-high heat. Pour about ¼ cup of batter for each pancake. Cook until bubbles appear on the surface and the edges look dry, about 2-3 minutes. Flip and cook until browned on the other side. Serve hot with butter and maple syrup."
    },
    {
        name: "Chicken and Broccoli Stir-Fry",
        image: "image/Chicken_and_Broccoli_Stir-Fry.png",
        ingredients: [
            "Boneless, skinless chicken breasts 1 pound cut into bite-sized pieces",
            "Soy sauce ½ cup",
            "Water ⅓ cup",
            "Brown sugar 2 tablespoons",
            "Cornstarch 1 tablespoon",
            "Garlic 2 cloves minced",
            "Ginger ½ teaspoon minced",
            "Broccoli florets 2 cups",
            "Sesame oil 1 tablespoon"
        ],
        recipe: "In a small bowl, whisk together the soy sauce, water, brown sugar, cornstarch, minced garlic, and ginger to create the sauce. Set aside. Heat sesame oil in a large skillet or wok over medium-high heat. Add the chicken pieces and cook until browned and cooked through. Add the broccoli florets to the skillet and stir-fry for 2-3 minutes until they start to turn bright green and tender-crisp. Stir the sauce one more time and pour it into the skillet with the chicken and broccoli. Cook, stirring constantly, until the sauce thickens and coats the chicken and broccoli evenly. Serve immediately with steamed rice."
    },
    {
        name: "Chocolate Chip Cookies",
        image: "image/Classic_Chocolate_Chip_Cookies.png",
        ingredients: [
            "All-purpose flour 2¼ cups",
            "Baking soda 1 teaspoon",
            "Salt 1 teaspoon",
            "Butter 1 cup softened",
            "White sugar ¾ cup",
            "Brown sugar ¾ cup packed",
            "Vanilla extract 1 teaspoon",
            "Eggs 2 large",
            "Semi-sweet chocolate chips 2 cups"
        ],
        recipe: "Preheat the oven to 375°F (190°C). In a small bowl, whisk together the flour, baking soda, and salt. Set aside. In a large bowl, using an electric mixer, beat the softened butter, white sugar, and brown sugar until creamy. Beat in the eggs one at a time, then stir in the vanilla extract. Gradually mix the dry ingredients into the wet ingredients until just combined. Stir in the chocolate chips. Drop rounded tablespoons of dough onto ungreased baking sheets. Bake for 9 to 11 minutes, or until the edges are golden brown. Let cool on the baking sheet for a few minutes before transferring to a wire rack to cool completely."
    }
];
const nameContainer = document.getElementById('name') as HTMLDivElement;
const imageContainer = document.getElementById('image') as HTMLDivElement;
const recipeContainer = document.getElementById('recipe') as HTMLDivElement;
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;

function getRandomMeal(): Meal {
    return meals[Math.floor(Math.random() * meals.length)];
}

function displayMeal(meal: Meal): void {
    if (nameContainer){
        nameContainer.innerHTML = `<h2>${meal.name}</h2>`;
    }
    if (imageContainer){
        imageContainer.innerHTML = `<img src="${meal.image}" alt="${meal.name}">`;
    }
    if (recipeContainer) {
        recipeContainer.innerHTML = `
            <h3>Ingredients:</h3>
            <ul>
                ${meal.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
            <h3>Recipe</h3>
            <p>${meal.recipe}</p>
        `;
    }
}

generateBtn.addEventListener('click', () => {
    const randomMeal = getRandomMeal();
    displayMeal(randomMeal);
});
