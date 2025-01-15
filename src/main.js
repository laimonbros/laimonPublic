import Game from './game.js';
import {TelegramWebAppMock} from "./telegramWebAppMock.js";

//SCORE INITIALIZE//
////////////////////

let currentFinalScore = 0; 


// CONST DOM ///
///////////////

const gameScreen = document.getElementById('game-screen');
const gameArea = document.getElementById('game-area');
const timerDisplay = document.getElementById('game-timer');
const scoreDisplay = document.getElementById('game-score');
const endGamePopup = document.getElementById('end-game-popup');
const rewardPoints = document.getElementById('reward-points');
const playButton = document.querySelector('.play-button');

const checkbox = document.getElementById('terms-checkbox');
const loginContainer = document.getElementById('login-container');
const appContent = document.getElementById('app-content');
const onboardingContainer = document.getElementById('onboarding-container');
const onboardingCards = document.querySelectorAll('.onboarding-card');
const skipButton = document.getElementById('onboarding-skip');

// Constants for Cooldown
const COOLDOWN_DURATION = 0.01 * 60 * 60 * 1000; // 4 hours in milliseconds
const LAST_GAME_TIME_KEY = 'lastGameTime';
const game = new Game(gameArea, timerDisplay, scoreDisplay, handleGameEnd, gameScreen);


// New Timer Elements
const nextGameTimer = document.getElementById('next-game-timer');
const timerElement = document.getElementById('timer');


const totalScoreValue = document.getElementById('score-value');

const leaderboardList = document.getElementById('leaderboard-list');


// Add event listener to login button
const loginButton = document.getElementById('login-button');
loginButton.addEventListener('click', telegramLogin);


//DAILY REWARDS//
/////////////////

const dailyRewardContainer = document.getElementById('daily-reward-page');

const tg = isTelegramWebApp() ? window.Telegram?.WebApp : TelegramWebAppMock;

function isTelegramWebApp() {
    // @ts-ignore
    return typeof TelegramWebviewProxy !== 'undefined';
}




// GAME END PROCESSOR ///
/////////////////////////

async function handleGameEnd(finalScore) {
    currentFinalScore = finalScore; 
    rewardPoints.textContent = finalScore; 

    // **Show the rewards and share-buttons divs**
    const rewardsDiv = document.querySelector('.rewards');
    const shareButtonsDiv = document.querySelector('.share-buttons');
    if (rewardsDiv) rewardsDiv.style.display = 'block';
    if (shareButtonsDiv) shareButtonsDiv.style.display = 'block';

    endGamePopup.style.display = 'flex'; 

    // Set the last game time to now
    const currentTime = Date.now();
    localStorage.setItem(LAST_GAME_TIME_KEY, currentTime.toString());

    // Show the timer in the popup
    nextGameTimer.style.display = 'block';
    startCountdown(COOLDOWN_DURATION);

    await saveGameResult(finalScore);

    async function saveGameResult(score) {
        const telegramId = tg.initDataUnsafe.user.id;
        if (!telegramId) {
            alert('Please log in to save your results.');
            return;
        }
    
        try {
            const response = await fetch('/api/games', {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({telegramId, score}),
            });
    
            if (!response.ok) {
                throw new Error('Failed to save game result');
            }
    
        } catch (error) {
            console.error('Error saving game result:', error);
            alert('Error saving game result. Please try again.');
        }
    }

}



// CLEAN COUNTDOWN //
/////////////////////


function clearCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    nextGameTimer.style.display = 'none';
    timerElement.textContent = '04:00:00';
}






// GAME LAUNCH BUTTON//
///////////////////////


playButton.addEventListener('click', () => {
    if (isCooldownActive()) {
        // If cooldown is active, show the end-game popup with the timer
        const remainingTime = getRemainingCooldown();
        updateTimerDisplay(remainingTime);
        nextGameTimer.style.display = 'block';
        endGamePopup.style.display = 'flex';

        // **Hide the rewards and share-buttons divs**
        const rewardsDiv = document.querySelector('.rewards');
        const shareButtonsDiv = document.querySelector('.share-buttons');
        if (rewardsDiv) rewardsDiv.style.display = 'none';
        if (shareButtonsDiv) shareButtonsDiv.style.display = 'none';

        // Start the countdown
        startCountdown(remainingTime);
    } else {
        // No cooldown, start the game
        endGamePopup.style.display = 'none'; // Hide popup if visible
        game.start(); // Start the game

        // **Ensure rewards and share-buttons divs are visible**
        const rewardsDiv = document.querySelector('.rewards');
        const shareButtonsDiv = document.querySelector('.share-buttons');
        if (rewardsDiv) rewardsDiv.style.display = 'block';
        if (shareButtonsDiv) shareButtonsDiv.style.display = 'block';
    }
});



function getRefParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref'); 
}

// LOADING SCREEN //
////////////////////


window.onload = function () {
    const loadingBar = document.getElementById('loading-bar');
    const loadingContainer = document.getElementById('loading-container');
    const loginContainer = document.getElementById('login-container');


    if (!loadingBar || !loadingContainer || !loginContainer) {
        console.error('One or more necessary elements are missing from the DOM.');
        return;
    }

    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);

            // Hide loading container
            loadingContainer.style.display = 'none';

            // Show login container
            loginContainer.style.display = 'flex';

        } else {
            width++;
            loadingBar.style.width = `${width}%`;
        }
    }, 10);
};


//INVITING GUESTS//
///////////////////

async function initInviteLink(telegramId) {
    const inviteItem = document.querySelector('.quest-item-invite');
    const invitePopup = document.getElementById('invite-popup');
    const closeButton = document.getElementById('close-popup');
    const copyLinkButton = document.getElementById('copy-link-button');

    if (!inviteItem || !invitePopup || !closeButton || !copyLinkButton) {
        console.error('Required elements not found');
        return;
    }

    // Fetch referral link and invite count
    const referralLink = `https://t.me/laimonbrosbot/laimon/ref?startapp=${telegramId}`;
    const inviteCount = await fetchInviteCount(telegramId);

    // Update the invite box content
    inviteItem.innerHTML = `
        <p>Invited <strong>${inviteCount}</strong> friends!</p>
        <div class="quest-reward">+100 <img src="img/lemon.png" alt="Lemon Icon" class="reward-icon"></div>
    `;

    // Make the whole box clickable
    inviteItem.addEventListener('click', () => {
        invitePopup.style.display = 'flex'; 
    });

    // Close popup when the close button is clicked
    closeButton.addEventListener('click', () => {
        invitePopup.style.display = 'none';
    });

    // Copy referral link to clipboard
    copyLinkButton.addEventListener('click', () => {
        navigator.clipboard.writeText(referralLink)
            .then(() => {
                alert('Referral link copied to clipboard!');
            })
            .catch((err) => {
                console.error('Error copying link: ', err);
            });
    });

    // Set up share buttons
    const twitterButton = document.getElementById('share-invite-twitter');
    const telegramButton = document.getElementById('share-invite-telegram');

    twitterButton.onclick = () => {
        const twitterShareUrl = `https://twitter.com/intent/tweet?text=Join%20me%20on%20this%20awesome%20app!&url=${encodeURIComponent(referralLink)}`;
        window.open(twitterShareUrl, '_blank');
    };

    telegramButton.onclick = () => {
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}`;
        window.open(telegramShareUrl, '_blank');
    };
}



// LOGIN SCREEN CONSTANTS//
///////////////////////////

// Before window.onload or at the top of the code
const privacyPolicyContainer = document.getElementById('privacy-policy-container');

// Check if user has logged in before
const hasLoggedInBefore = localStorage.getItem('hasLoggedIn') === 'true';

// If user has logged in before, hide the privacy policy checkbox
if (hasLoggedInBefore && privacyPolicyContainer) {
    privacyPolicyContainer.style.display = 'none';
}

//LOGIN SCREEN BASE//
/////////////////////

async function telegramLogin() {
    // Check if checkbox exists and is checked (only if visible)
    if (!hasLoggedInBefore) {
        const checkbox = document.getElementById('terms-checkbox');
        if (!checkbox || !checkbox.checked) {
            alert('You must agree with the privacy policy.');
            return;
        }
    }

    // Telegram Web App Integration
    if (!tg.initData || !tg.initDataUnsafe.user) {
        alert('Failed to authenticate with Telegram. Please try again.');
        return;
    }

    const telegramId = tg.initDataUnsafe.user.id;
    const username = tg.initDataUnsafe.user.username || 'Unknown';
    const start_param = tg.initDataUnsafe.start_param || null;

    try {
        const response = await fetch('/api/users', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({telegramId, username, start_param}),
        });

        if (response.ok) {
            // Hide login container
            loginContainer.style.display = 'none';

            // Set localStorage flag after successful login
            localStorage.setItem('hasLoggedIn', 'true');

            // Save userId for later use in mini-game logic
            window.telegramId = telegramId;
            window.isNewUser = response.status === 201;

            // **New Integration Point**
            await checkNewUserAndShowOnboarding(response.status === 201);

        } else {
            alert('Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Error during Telegram login:', error);
        alert('Login failed due to a server error.');
    }
}


//FOOTER//
/////////

document.addEventListener('DOMContentLoaded', () => {
    const footerItems = document.querySelectorAll('.footer-item');
    const appContent = document.getElementById('app-content');
    const questsTab = document.getElementById('quests-tab');
    const leaderboardTab = document.getElementById('leaderboard-tab');
    const profileTab = document.getElementById('profile-tab'); // New tab

    const tabs = {
        Main: appContent,
        Quests: questsTab,
        Leaderboard: leaderboardTab,
        Profile: profileTab, // Add Profile tab
    };

    // Icon map for active and inactive states
    const iconMap = {
        Main: { active: 'img/main.svg', inactive: 'img/main1.svg' },
        Leaderboard: { active: 'img/leader.svg', inactive: 'img/leader1.svg' },
        Quests: { active: 'img/quests2.svg', inactive: 'img/quests.svg' },
        Profile: { active: 'img/profile.svg', inactive: 'img/profile1.svg' },
    };

    // Make Main tab active by default
    if (tabs.Main) {
        tabs.Main.classList.add('active'); // Activate Main content
    }
    footerItems.forEach((item) => {
        if (item.getAttribute('data-tab') === 'Main') {
            item.classList.add('active'); // Highlight Main footer item
            const icon = item.querySelector('.footer-icon');
            icon.src = iconMap.Main.active;
        }
    });

    // Footer Tabs Click Logic
    footerItems.forEach((item) => {
        item.addEventListener('click', () => {
            try {
                const tab = item.getAttribute('data-tab'); // Get the selected tab
                console.log(`Tab clicked: ${tab}`); // Log the clicked tab

                // Hide all tabs and remove 'active' class
                Object.keys(tabs).forEach((key) => {
                    if (tabs[key]) {
                        tabs[key].classList.remove('active');
                    }
                });

                // Add 'active' class to the selected tab
                if (tabs[tab]) {
                    tabs[tab].classList.add('active');
                }

                // Update active state for footer items and toggle icons
                footerItems.forEach((footerItem) => {
                    footerItem.classList.remove('active');
                    const footerTab = footerItem.getAttribute('data-tab');
                    const icon = footerItem.querySelector('.footer-icon');
                    if (footerTab) {
                        icon.src = iconMap[footerTab].inactive; // Set to inactive
                    }
                });

                // Highlight the clicked item and set its icon to active
                item.classList.add('active');
                const activeIcon = item.querySelector('.footer-icon');
                if (activeIcon) {
                    activeIcon.src = iconMap[tab].active;
                }
            } catch (error) {
                console.error('Error during tab switching:', error);
            }
        });
    });
});


// COUNT OF INVITED USERS//
///////////////////////////

async function fetchInviteCount(invitedUserId) {
    try {
        const response = await fetch(`/api/invites/count/${invitedUserId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch invite count');
        }
        const data = await response.json();
        return data.count || 0;
    } catch (error) {
        console.error(`Error fetching invite count for ${invitedUserId}:`, error);
        return 0;
    }
}


// LEADERBOARD  //
//////////////////



async function getRewardScores() {
    const telegramId = window.telegramId

    const response = await fetch(`/api/rewards/total/${telegramId}`, {
        method: 'GET', headers: {'Content-Type': 'application/json'},
    });

    const data = await response.json();

    const totalRewardScore = data.totalRewardScore
    return totalRewardScore;
}

async function getGameScores() {
    const telegramId = window.telegramId

    const response = await fetch(`/api/games/total/${telegramId}`, {
        method: 'GET', headers: {'Content-Type': 'application/json'},
    });

    const data = await response.json();

    const totalGameScore = data.totalGameScore
    return totalGameScore;
}





async function populateLeaderboard(telegramId_N) {
    try {
       
        const response = await fetch('/api/users/leaderboard');
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard data');
        }
        const leaderboardData = await response.json();


// LEADERBORD SNIPPET FOR CORRECT UPDATES

const totalRewardScore = await getRewardScores();   // e.g. /api/rewards/total/:id
const totalGameScore   = await getGameScores();     // e.g. /api/games/total/:id
let inviteCount        = await fetchInviteCount(telegramId_N);
inviteCount            = Math.min(inviteCount, 10); // Up to 10 invites
const totalScore       = totalRewardScore + totalGameScore + inviteCount * 100;

// Find the index of the current user in the leaderboard array
const userIndexInLeaderboard = leaderboardData.findIndex(
  (u) => u.telegramId == telegramId_N  // use == in case of string/number mismatch
);

// If found, overwrite that user's score with the correct total
if (userIndexInLeaderboard !== -1) {
    leaderboardData[userIndexInLeaderboard].score = totalScore;
}



        // DOM Leaderboard
        const leaderboardTop = document.querySelector('.leaderboard-top');
        const leaderboardList = document.getElementById('leaderboard-list');
        const userPlacement = document.querySelector('.user-placement');

        // Clean current content 
        leaderboardTop.innerHTML = '';
        leaderboardList.innerHTML = '';


 

// LEADERBOARD TOP 3  // 


function truncateString(str, maxLength) {
    if (typeof str !== 'string') return '';
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

let top3Users = leaderboardData.slice(0, 3);

if (top3Users.length === 3) {
    // Reorder the first three users so that:
    // top3Users[0] = 2nd place user (left)
    // top3Users[1] = 1st place user (center, with crown)
    // top3Users[2] = 3rd place user (right)
    const [first, second, third] = top3Users;
    top3Users = [second, first, third];
}

top3Users.forEach((user, index) => {
    // After reordering:
    // index=0 => 2nd place
    // index=1 => 1st place (crown)
    // index=2 => 3rd place
    
    let displayPlace;
    if (index === 0) {
        displayPlace = 2;
    } else if (index === 1) {
        displayPlace = '<span class="crown-icon"><img src="img/crown.png" alt="Crown"/></span>';
    } else {
        displayPlace = 3;
    }

    const userDiv = document.createElement('div');
    userDiv.className = `leaderboard-top-item ${index === 1 ? 'leader' : ''}`;

    // Truncate username if necessary
    const displayUsername = truncateString(user.username, 6);

    // Use index+1 only for avatar fallback naming, not for place logic
    const avatarSrc = user.telegramAvatar ? user.telegramAvatar : `img/ava-place${index+1}.png`;

    userDiv.innerHTML = `
    <p>${displayPlace}</p>
    <img 
        src="${avatarSrc}" 
        alt="User ${index+1}" 
        onerror="this.onerror=null; this.src='img/avatar${index+1}.png';"
    />
    <p>@${displayUsername}</p>
    <p>
        ${user.score} 
        <span class="leaf-icon" aria-hidden="true"></span>
    </p>
`;

    leaderboardTop.appendChild(userDiv);
});


       

  // LEADERBOARD - OTHER PLACES//
  //////////////////////////////

const otherUsers = leaderboardData.slice(3);
otherUsers.forEach((user, index) => {
    const position = index + 4; // Starting place 4

    // Generate a random number between 1 and 4 for avatar selection
    const randomAvatarNumber = Math.floor(Math.random() * 4) + 1;

    // Truncate username if necessary
    const displayUsername = truncateString(user.username, 6);

    const userDiv = document.createElement('div');
    userDiv.className = 'leaderboard-item';

    userDiv.innerHTML = `
        <p>${position}</p>
        <img src="img/ava-place${randomAvatarNumber}.png" alt="User ${position}"/>
        <p class="nickname">@${displayUsername}</p>
        <p class="points">${user.score} <span class="leaf-icon"></span></p>
    `;

    leaderboardList.appendChild(userDiv);
});



      
// Use loose equality (==) to handle potential type differences between telegramId_N and user.telegramId
const userIndex = leaderboardData.findIndex(user => user.telegramId == telegramId_N);
if (userIndex !== -1) {
    const user = leaderboardData[userIndex];
    userPlacement.innerHTML = `Your place is <strong>${userIndex + 1}</strong> among ${leaderboardData.length}, score: <strong>${user.score}</strong>`;
} else {
    userPlacement.innerHTML = `Your place is <strong>not found</strong>`;
}

    } catch (error) {
        console.error('Error populating leaderboard:', error);
    }
}



async function updateTotalScores() {
    const totalRewardScore = await getRewardScores();
    const totalGameScore = await getGameScores();

    let inviteCount = await fetchInviteCount(window.telegramId);
    inviteCount = Math.min(inviteCount, 10); // Ensure invite count does not exceed 10

    const totalScore = totalRewardScore + totalGameScore + inviteCount * 100;

    // Update total score on the main screen
    totalScoreValue.innerText = totalScore;

    // Populate the leaderboard with updated total score
    await populateLeaderboard(window.telegramId);
}




async function showMain() {
    await updateTotalScores();

    await setupQuests();

    await initInviteLink(window.telegramId);

    appContent.style.display = 'block';
}


//ONBOARDING//
//////////////

// Then define the showOnboarding function
function showOnboarding(container, cards, appContent, skipButton) {
    let currentCardIndex = 0;

    function showNextCard() {
        cards[currentCardIndex].classList.remove('active');
        currentCardIndex++;
        if (currentCardIndex < cards.length) {
            // Show the next onboarding card
            cards[currentCardIndex].classList.add('active');
        } else {
            // Ensure onboarding is hidden before showing the daily reward page
            container.style.display = 'none';
            showDailyReward(); // Call the showDailyReward function here
        }
    }

    container.style.display = 'flex';
    cards[currentCardIndex].classList.add('active');

    skipButton.addEventListener('click', () => {
        container.style.display = 'none';
        showDailyReward();
    });

    container.addEventListener('click', showNextCard);
}


/**
 * Determines whether to show onboarding or daily reward screens based on user status.
 * @param {boolean} isNewUser - Indicates if the user is new.
 */
async function checkNewUserAndShowOnboarding(isNewUser) {
    if (isNewUser) {
        // Show onboarding for new users
        showOnboarding(onboardingContainer, onboardingCards, appContent, skipButton);
    } else {
        // For returning users, check if they've already claimed today's reward
        const alreadyClaimed = await hasAlreadyClaimedToday();
        if (alreadyClaimed) {
            // Skip reward screen and show main content
            showMain();
        } else {
            // Show daily reward screen
            showDailyReward();
        }
    }
}




//FUNCTION IF CLAIMED//

/**
 * Checks if the user has already claimed today's daily reward.
 * @returns {Promise<boolean>} - Returns true if already claimed, else false.
 */
async function hasAlreadyClaimedToday() {
    const telegramId = window.telegramId;
    if (!telegramId) {
        console.error('Telegram ID is not defined.');
        return false; // Assuming not claimed if no Telegram ID
    }

    const rewardDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    try {
        const response = await fetch('/api/rewards/check-daily', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, rewardDate }),
        });

        if (!response.ok) {
            console.error(`Server error: ${response.status}`);
            return false; // Treat as not claimed on server error
        }

        const data = await response.json();

        // If data.rewardDate exists and matches today, reward has been claimed
        if (data && data.rewardDate === rewardDate) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error checking daily reward:', error);
        return false; // Treat as not claimed on fetch error
    }
}





// DAILY REWARDS //
///////////////////

async function showDailyReward() {
    const telegramId = window.telegramId;

    if (!telegramId) {
        console.error('Telegram ID is not defined.');
        await showMain(); // Redirect to the main screen
        return;
    }

    // Show the daily rewards page
    dailyRewardContainer.style.display = 'flex';

    const claimButton = document.getElementById('claim-reward-button');
    const rewardDate = new Date().toISOString().split('T')[0];

    try {
        const response = await fetch('/api/rewards/check-daily', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, rewardDate }),
        });

        if (!response.ok) {
            let errorMsg = `Server error: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMsg = errorData.error;
                }
            } catch (e) {
                // Ignore JSON parsing errors
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log('Received data from /api/rewards/check-daily:', data);

        // Modify this line to handle null data
        const isNewUser = !data || data.isNewUser || !data.rewardDate;

        if (isNewUser) {
            console.log('New user detected. Automatically initializing Day 1 rewards.');

            // Initialize Day 1 for new users
            const dayNumber = 1;
            const amount = dayNumber * 10;

            // Update HTML spans
            const dayNumberElement = document.getElementById('daily-day-number');
            const bonusAmountElement = document.getElementById('daily-bonus-amount');
            if (dayNumberElement && bonusAmountElement) {
                dayNumberElement.innerText = `Day ${dayNumber}`;
                bonusAmountElement.innerText = `${amount} Points`;
            }

            // Set up claim button for new users
            const newClaimButton = claimButton.cloneNode(true);
            claimButton.parentNode.replaceChild(newClaimButton, claimButton);

            newClaimButton.addEventListener('click', async () => {
                const claimResponse = await fetch('/api/rewards/daily', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ telegramId, amount, rewardDate }),
                });

                if (claimResponse.ok) {
                    dailyRewardContainer.style.display = 'none';
                    await showMain(); // Redirect to the main screen
                } else {
                    console.error('Error claiming reward.');
                }
            });

            return; // Exit early for new users
        }

        // Existing user logic
        if (!data.rewardDate) {
            throw new Error('Missing rewardDate in response data.');
        }

        const lastRewardDate = new Date(data.rewardDate);
        const currentTime = new Date();
        const timeDifference = currentTime - lastRewardDate;

        // Shorten 24-hour gap to 5 seconds for testing
        const TESTING_GAP = 5 * 1000; // 5 seconds for testing
        const PRODUCTION_GAP = 24 * 60 * 60 * 1000; // 24 hours
        const timeGap = TESTING_GAP; // Change this to PRODUCTION_GAP for production





// ------------------------------------------------------
// SNIPPET RIGHT AFTER const timeGap = ...
// ------------------------------------------------------

let updatedDayNumber;

if (!data.dayNumber) {
    // If there's no recorded dayNumber, start at 1
    updatedDayNumber = 1;
} else {
    // If the user’s last claim was more than timeGap seconds ago:
    // reset to day 1. Otherwise, continue to the next day.
    if (timeDifference > timeGap) {
        updatedDayNumber = 1;
    } else {
        updatedDayNumber = data.dayNumber + 1;
    }
}

// We'll now use updatedDayNumber in place of data.dayNumber
// ------------------------------------------------------



        if (timeDifference < timeGap) {
            dailyRewardContainer.style.display = 'none';
            await showMain(); // Redirect to the main screen
            return;
        }

        let dayNumber = updatedDayNumber; 

        let amount = dayNumber * 10;
        if (dayNumber % 5 === 0) {
            amount += 100;
        }




        const dayNumberElement = document.getElementById('daily-day-number');
        const bonusAmountElement = document.getElementById('daily-bonus-amount');

        if (dayNumberElement && bonusAmountElement) {
            dayNumberElement.innerText = `Day ${dayNumber}`;
            bonusAmountElement.innerText = `${amount} Points`;
        }

        const newClaimButton = claimButton.cloneNode(true);
        claimButton.parentNode.replaceChild(newClaimButton, claimButton);

        newClaimButton.addEventListener('click', async () => {
            const claimResponse = await fetch('/api/rewards/daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, amount, rewardDate }),
            });

            if (claimResponse.ok) {
                dailyRewardContainer.style.display = 'none';
                await showMain(); // Redirect to the main screen
            } else {
                console.error('Error claiming reward.');
            }
        });

    } catch (error) {
        console.error('Error during daily reward:', error);
        await showMain(); // Redirect to the main screen in case of errors
    }
}





// SHARE RESULTS TO SOCIALS // 
//////////////////////////////

document.getElementById('share-twitter').addEventListener('click', () => {
    const appLink = encodeURIComponent('https://t.me/laimonbrosbot/laimon'); // Replace with your app's URL
    const message = encodeURIComponent(`I just scored ${currentFinalScore} points on Laimon Bros! Check it out!`);
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${message}&url=${appLink}`;
    window.open(twitterShareUrl, '_blank');
});



// BACK TO MAIN 
document.getElementById('share-to-main').addEventListener('click', () => {
    endGamePopup.style.display = 'none';
    clearCountdown();
    showMain();
});


document.getElementById('share-telegram').addEventListener('click', () => {
    const appLink = encodeURIComponent('https://t.me/laimonbrosbot/laimon'); // Replace with your app's URL
    const message = encodeURIComponent(`I just scored ${currentFinalScore} points on Laimon Bros! Check it out!`);
    const telegramShareUrl = `https://t.me/share/url?url=${appLink}&text=${message}`;
    window.open(telegramShareUrl, '_blank');
});

//// Countdown Interval
let countdownInterval = null;

// Function to start the countdown timer
function startCountdown(remainingTime) {
    updateTimerDisplay(remainingTime);

    // Clear any existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    // Start a new interval to update every second
    countdownInterval = setInterval(() => {
        remainingTime -= 1000;
        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            nextGameTimer.style.display = 'none';
            timerElement.textContent = '04:00:00';
            localStorage.removeItem(LAST_GAME_TIME_KEY);
        } else {
            updateTimerDisplay(remainingTime);
        }
    }, 1000);
}

// Function to update the timer display
function updateTimerDisplay(time) {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    // Format as HH:MM:SS
    const formattedTime = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0'),
    ].join(':');

    timerElement.textContent = formattedTime;
}

// COUNTDOWN
function isCooldownActive() {
    const lastGameTime = localStorage.getItem(LAST_GAME_TIME_KEY);
    if (!lastGameTime) {
        return false;
    }

    const lastTime = parseInt(lastGameTime, 10);
    const currentTime = Date.now();

    return (currentTime - lastTime) < COOLDOWN_DURATION;
}

// Function to get remaining cooldown time
function getRemainingCooldown() {
    const lastGameTime = localStorage.getItem(LAST_GAME_TIME_KEY);
    if (!lastGameTime) {
        return 0;
    }

    const lastTime = parseInt(lastGameTime, 10);
    const currentTime = Date.now();

    const elapsed = currentTime - lastTime;
    const remaining = COOLDOWN_DURATION - elapsed;
    return remaining > 0 ? remaining : 0;
}


//PROFILE//
///////////


// Fetch name and profile pic
    Telegram.WebApp.ready();

    const user = Telegram.WebApp.initDataUnsafe.user;

    if (user && user.username) {
        document.getElementById('telegram-username').textContent = user.username;
    } else {
        document.getElementById('telegram-username').textContent = 'User';
    }


// Support tab 

const supportOption = document.getElementById('support-option');
if (supportOption) {
    supportOption.addEventListener('click', () => {
        window.open('https://t.me/team_laimonbros', '_blank');
    });
}


// Fetch profile pic


    document.addEventListener('DOMContentLoaded', function() {
        // Function to select a random placeholder
        function getRandomPlaceholder() {
            const placeholders = [
                'img/ava-place1.png',
                'img/ava-place2.png',
                'img/ava-place3.png',
                'img/ava-place4.png'
            ];
            const randomIndex = Math.floor(Math.random() * placeholders.length);
            return placeholders[randomIndex];
        }

        // Function to set the profile picture
        function setProfilePicture(user) {
            const avatarImg = document.getElementById('profile-avatar');
            const usernameSpan = document.getElementById('telegram-username');

            // Set the username
            usernameSpan.textContent = user.username || `${user.first_name} ${user.last_name || ''}`.trim() || 'User';

            if (user.photoUrl) {
                avatarImg.src = user.photoUrl;

                // If the image fails to load, fallback to a random placeholder
                avatarImg.onerror = function() {
                    avatarImg.src = getRandomPlaceholder();
                };
            } else {
                // If no photo URL, use a random placeholder
                avatarImg.src = getRandomPlaceholder();
            }
        }

        // Example: Integrate with Telegram Web Apps (if applicable)
        if (window.Telegram && window.Telegram.WebApp) {
            // Initialize Telegram Web App
            const telegram = window.Telegram.WebApp;

            // Get user data
            const user = telegram.initDataUnsafe.user;

            
            function fetchTelegramPhotoUrl(user) {
                

                // Return a Promise that resolves to the photo URL or null
                return fetch('/get-telegram-photo-url', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user_id: user.id })
                })
                .then(response => response.json())
                .then(data => data.photoUrl || null)
                .catch(() => null);
            }

            // Fetch and set the profile picture
            fetchTelegramPhotoUrl(user).then(photoUrl => {
                user.photoUrl = photoUrl;
                setProfilePicture(user);
            }).catch(() => {
                setProfilePicture(user);
            });
        } else {
            // If not using Telegram Web Apps, use a random placeholder and default username
            const avatarImg = document.getElementById('profile-avatar');
            const usernameSpan = document.getElementById('telegram-username');

            avatarImg.src = getRandomPlaceholder();
            usernameSpan.textContent = 'Guest';
        }
    });


//PROFILE POLICIES 


    // Add the following code to your main.js file, preferably after other DOMContentLoaded listeners

document.addEventListener('DOMContentLoaded', () => {
    // Get references to the new menu items
    const termsAndConditions = document.getElementById('terms-and-conditions');
    const userAgreement = document.getElementById('user-agreement');

    // Get references to the popup elements
    const popupOverlay = document.getElementById('popup-overlay');
    const popupTitle = document.getElementById('popup-title');
    const popupText = document.getElementById('popup-text');
    const closeButton = document.querySelector('.close-button');

    // Function to open the popup with specified title and content URL
    async function openPopup(title, contentUrl) {
        try {
            const response = await fetch(contentUrl);
            if (!response.ok) {
                throw new Error(`Failed to load content: ${response.status}`);
            }
            const content = await response.text();
            popupTitle.innerText = title;
            popupText.innerHTML = content;
            popupOverlay.style.display = 'flex';
        } catch (error) {
            console.error('Error loading popup content:', error);
            alert('Failed to load content. Please try again later.');
        }
    }

    // Function to close the popup
    function closePopup() {
        popupOverlay.style.display = 'none';
        popupTitle.innerText = '';
        popupText.innerHTML = '';
    }

    // Event listeners for the new menu items
    termsAndConditions.addEventListener('click', () => {
        openPopup('Privacy Policy', 'src/privacy.html');
    });

    userAgreement.addEventListener('click', () => {
        openPopup('Terms and Conditions', 'src/terms.html');
    });

    // Event listener for the close button
    closeButton.addEventListener('click', closePopup);

    // Optional: Close the popup when clicking outside the popup content
    popupOverlay.addEventListener('click', (event) => {
        if (event.target === popupOverlay) {
            closePopup();
        }
    });
});





// QUESTS - Links and Lists //
//////////////////////////////

const quests = [{type: 'twitter', elementId: 'quest-item-twitter', url: 'https://x.com/laimonbros/'}, 
    
    {type: 'telegram',
    elementId: 'quest-item-telegram',
    url: 'https://t.me/laimonbros/'}, 

{type: 'discord', elementId: 'quest-item-discord', url: 'https://www.linkedin.com/company/laimonbros/'},

];

// Check quest fullfill
async function checkSingleReward(telegramId, type) {
    try {
        const response = await fetch('/api/rewards/check-single', {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({telegramId, type}),
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }

        return false;


    } catch (error) {
        console.error(`Error checking reward for ${type}:`, error);
        return true; 
    }
}

// Get reward 

async function claimSingleReward(telegramId, amount, type) {
    try {
        const response = await fetch('/api/rewards/single', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({telegramId, amount, type}),
        });

        if (!response.ok) throw new Error('Failed to claim reward');
        return await response.json();
    } catch (error) {
        console.error(`Error claiming reward for ${type}:`, error);
        return null;
    }
}

// Tasks processor 

async function setupQuests() {
    for (const quest of quests) {
        const questElement = document.getElementById(quest.elementId);
        const rewardElement = questElement.querySelector('.quest-reward');

        // Check task processing 
        const rewardReceived = await checkSingleReward(window.telegramId, quest.type);

        if (!rewardReceived) {
            // If task is not fullfilled show +100 and lemon 
            rewardElement.style.display = 'flex';
            rewardElement.innerHTML = `
                +100 <img src="img/lemon.png" alt="Lemon Icon" class="reward-icon" style="cursor: pointer;">
            `;

            questElement.addEventListener('click', async () => {

                //Get reward

                const result = await claimSingleReward(window.telegramId, 100, quest.type);

                if (result) {

                    rewardElement.innerHTML = `
                        +100 <img src="img/lemon-bw.png" alt="Gray Lemon Icon" class="reward-icon" />
                    `;

                    // Go to the link 
                    window.location.href = quest.url;
                }
            });
        } else {
            // If task if fulfilled show grey lemon 
            rewardElement.style.display = 'flex'; // Show element
            rewardElement.innerHTML = `
                <img src="img/lemon-bw.png" alt="Gray Lemon Icon" class="reward-icon" />`;
        }
    }
}


