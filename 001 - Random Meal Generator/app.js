"use strict";
const meals = [
    {
        name: "Spaghetti Bolognese",
        image: "https://www.slimmingeats.com/blog/wp-content/uploads/2010/04/spaghetti-bolognese-36-720x720.jpg",
        ingredients: ["Spaghetti", "Minced Beef", "Tomato Sauce", "Onion", "Garlic"]
    },
    {
        name: "Chicken Curry",
        image: "https://www.kitchensanctuary.com/wp-content/uploads/2022/09/Air-Fryer-Chicken-Curry-square-FS.jpg",
        ingredients: ["Chicken Breast", "Coconut Milk", "Curry Powder", "Rice", "Peas"]
    },
    {
        name: "Vegetable Stir-fry",
        image: "https://www.acouplecooks.com/wp-content/uploads/2020/04/Vegetable-Stir-Fry-051.jpg",
        ingredients: ["Broccoli", "Carrots", "Bell Peppers", "Soy Sauce", "Noodles"]
    }
];
const mealContainer = document.getElementById('meal');
const generateBtn = document.getElementById('generate-btn');
function getRandomMeal() {
    return meals[Math.floor(Math.random() * meals.length)];
}
function displayMeal(meal) {
    if (mealContainer) {
        mealContainer.innerHTML = `
            <h2>${meal.name}</h2>
            <img src="${meal.image}" alt="${meal.name}" width="300">
            <h3>Ingredients:</h3>
            <ul>
                ${meal.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
        `;
    }
}
generateBtn.addEventListener('click', () => {
    const randomMeal = getRandomMeal();
    displayMeal(randomMeal);
});
// Display a meal on initial load
const initialMeal = getRandomMeal();
displayMeal(initialMeal);
