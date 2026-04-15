
// Random color for presence
export function getRandomColor() {
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
    return colors[Math.floor(Math.random() * colors.length)]
}

// Random guest name
export function getGuestName() {
    const names = [
        "Digital Chef", "Menu Designer", "Taste Master", "Gourmet Editor",
        "Flavor Architect", "Culinary Curator", "Recipe Writer", "Dining Director"
    ]
    return names[Math.floor(Math.random() * names.length)]
}
