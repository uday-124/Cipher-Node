//Audio setup
const keyStrokeSounds = [
    new Audio("/sounds/keystroke1.mp3"),
    new Audio("/sounds/keystroke2.mp3"),
    new Audio("/sounds/keystroke3.mp3"),
    new Audio("/sounds/keystroke4.mp3"),
];

function useKeyboardSound() {
    const playRandomKeyStrikeSound = () => {
        const randomSound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];
        randomSound.currentTime = 0; //This is for a better UX, def add this
        randomSound.play().catch(error => console.log("Audio play failed:", error))
    }

    return {playRandomKeyStrikeSound}
}

export default useKeyboardSound;