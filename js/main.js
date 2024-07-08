const apiKey = 'cf5ad875f3abb04224dc330cae50f22d'; // Replace with your OpenWeatherMap API key
let currentUnit = 'metric'

// Function to get current weather
async function getCurrentWeather(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.statusText}`);
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('weather-info').innerHTML = '<p>Error fetching weather data. Please try again later.</p>';
    }
}

// Function to search for a city
async function searchCity() {
    const city = document.getElementById('city-search').value;
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.length > 0) {
            const { lat, lon } = data[0];
            getCurrentWeather(lat, lon);
            getWeeklyWeatherForecast(lat, lon);
        } else {
            document.getElementById('weather-info').innerHTML = '<p>No location data found for the entered city.</p>';
            document.getElementById('weekly-weather-info').innerHTML = '<p>No location data found for the entered city.</p>';
        }
    } catch (error) {
        console.error('Error fetching location data:', error);
        document.getElementById('weather-info').innerHTML = '<p>Error fetching location data. Please try again later.</p>';
        document.getElementById('weekly-weather-info').innerHTML = '<p>Error fetching location data. Please try again later.</p>';
    }
}

// Function to display weather data
function displayWeather(data) {
    if (!data.weather || !Array.isArray(data.weather) || data.weather.length === 0) {
        console.error('Invalid weather data:', data);
        document.getElementById('weather-info').innerHTML = '<p>Error fetching weather data. Please try again later.</p>';
        return;
    }

    const description = data.weather[0].description || 'No description available';
    const temperature = data.main && data.main.temp !== undefined ? Math.round(data.main.temp) : 'N/A';
    let locationInfo = '';

    if (data.name) {
        locationInfo += `${data.name}`;  // Append city name if available
    }
    
    if (data.sys && data.sys.country) {
        if (!data.name) {
            locationInfo = data.sys.country;  // Set only country if city name is absent
        } else {
            locationInfo += `, ${data.sys.country}`;  // Append country if city name is present
        }
    }

    const currentDate = new Date();
    const options = { day: 'numeric', month: 'long', weekday: 'long' };
    const formattedDate = currentDate.toLocaleDateString('en-US', options);

    const iconCode = data.weather[0].icon; // Icon code provided by OpenWeatherMap API
    const iconElement = document.getElementById('weather-icon');
    iconElement.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${description}">`;

    document.getElementById('description').textContent = `Weather: ${description}`;
    document.getElementById('temperature').textContent = `Temperature: ${temperature}°${currentUnit === 'metric' ? 'C' : 'F'}`;
    document.getElementById('location').textContent = `Location: ${locationInfo}`;
    document.getElementById('current-date').textContent = `Date: ${formattedDate}`;
}

// Function to get the user's location based on IP
async function ipLookUp() {
    try {
        const response = await fetch("https://ipinfo.io/json?token=c911bdc7b7363b");
        if (!response.ok) {
            throw new Error(`IP API error: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.city) {
            throw new Error('Location data is missing from the response');
        }
        const city = data.city;

        const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.statusText}`);
            }
             const data = await response.json();
             if (data.length > 0) {
                const { lat, lon } = data[0];
                getCurrentWeather(lat, lon);
                getWeeklyWeatherForecast(lat, lon);
            } else {
                document.getElementById('weather-info').innerHTML = '<p>No location data found for the entered city.</p>';
                document.getElementById('weekly-weather-info').innerHTML = '<p>No location data found for the entered city.</p>';
            }
        } catch (error) {
            console.error('Error fetching IP location:', error);
            document.getElementById('weather-info').innerHTML = '<p>Error fetching location data. Please try again later.</p>';
            document.getElementById('weekly-weather-info').innerHTML= '<p>Error fetching location data. Please try again later.</p>';
        }
    }  catch (error) {
        console.error('Error fetching IP location:', error);
        document.getElementById('weather-info').innerHTML = '<p>Error fetching location data. Please try again later.</p>';
        document.getElementById('weekly-weather-info').innerHTML= '<p>Error fetching location data. Please try again later.</p>';
    }
}

async function getWeeklyWeatherForecast(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=7&appid=${apiKey}&units=${currentUnit}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.statusText}`);
        }
        const data = await response.json();
        displayWeeklyForecast(data);
    } catch (error) {
        console.error('Error fetching weekly weather forecast:', error);
        document.getElementById('weekly-weather-info').innerHTML = '<p>Error fetching weekly weather forecast. Please try again later.</p>';
    }
}

// Function to display weekly weather forecast
function displayWeeklyForecast(data) {
    const weeklyForecastContainer = document.getElementById('weekly-weather-info');
    weeklyForecastContainer.innerHTML = ''; // Clear previous forecast data

    const labels = [];
    const temperatures = [];
    const temperatures2=[]

    data.list.forEach(day => {
        const date = new Date(day.dt * 1000); // Convert UNIX timestamp to JavaScript Date object
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        const dayTemperature = Math.round(day.temp.day);
        const nightTemperature = Math.round(day.temp.night);
        const description = day.weather[0].description;
        const iconCode = day.weather[0].icon; // Icon code provided by OpenWeatherMap API

        labels.push(formattedDate);
        temperatures.push(dayTemperature);
        temperatures2.push(nightTemperature);


        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <p>${formattedDate}</p>
            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}">
            <p>Day: ${dayTemperature}°${currentUnit === 'metric' ? 'C' : 'F'}</p>
            <p>Night: ${nightTemperature}°${currentUnit === 'metric' ? 'C' : 'F'}</p>
            <p>${description}</p>
            
        `;
        weeklyForecastContainer.appendChild(forecastItem);
    });

    const weeklyForecastChart=document.getElementById('chart');
    weeklyForecastChart.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.id='temperature-chart';
    canvas.height=400;
    weeklyForecastChart.appendChild(canvas);

    // Create line chart
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Daily Temperature (°${currentUnit === 'metric' ? 'C' : 'F'})`,
                data: temperatures,
                borderColor: '#3daff5',
                pointHoverBackgroundColor: '#c9ff70',
                tension: 0.1,
                fill: false,
            },
            {
                label: `Night Temperature (°${currentUnit === 'metric' ? 'C' : 'F'})`,
                data: temperatures2,
                borderColor: '#f0aa4f',
                backgroundColor: '#f0aa4f52',
                pointHoverBackgroundColor: '#c9ff70',
                pointRadius:3,
                tension: 0.1,
                fill: true,
            }
        
        ]
        },
        options: {
            animations: {
                tension: {
                  duration: 1000,
                  easing: 'linear',
                  from: 0.5,
                  to: 0,
                  loop: true
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false, // Disable y axis grid lines
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    grid: {
                        display: false, // Disable y axis grid lines
                    },
                    title: {
                        display: false,
                        text: `Temperature (°${currentUnit === 'metric' ? 'C' : 'F'})`
                    },
                    beginAtZero: true
                }
            },
            
        }
    });
}


function setUnit(unit) {
    currentUnit = unit;
    document.getElementById('metric-btn').classList.toggle('active', unit === 'metric');
    document.getElementById('imperial-btn').classList.toggle('active', unit === 'imperial');

    const city = document.getElementById('city-search').value;
    if (city) {
        searchCity();
    } else {
        ipLookUp();
    }
}

document.getElementById('city-search').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchCity();
    }
});

// Call the function to fetch weekly weather forecast based on IP location when the page loads
document.addEventListener('DOMContentLoaded', () => {
    ipLookUp(); // Fetch current weather based on IP location 
});


 
 
// Function to update the weather information in the DOM
//function updateWeatherInfo(data) {
//    const weatherInfo = document.getElementById('weather-info');
  //  const weatherDescription = data.weather[0].description;
    //const temp = data.main.temp;
    //const city = data.name;
    //weatherInfo.innerHTML = `
    //    <h2>${city}</h2>
    //    <p>${weatherDescription}</p>
    //    <p>${temp} &deg;C</p>
    //`;
    // Update weather image based on condition
    //updateWeatherImage(weatherDescription);
//}

// Function to update weather image based on condition
//function updateWeatherImage(description) {
//    const weatherInfo = document.getElementById('weather-info');
 //   let imageUrl;
//    if (description.includes('sunny')) {
//        imageUrl = 'images/sunny.png';
//    } else if (description.includes('cloudy')) {
//        imageUrl = 'images/cloudy.png';
//    } else if (description.includes('rain')) {
//        imageUrl = 'images/rainy.png';
//    } else {
//        imageUrl = 'images/default.png';
//    }
//    const imgElement = document.createElement('img');
//    imgElement.src = imageUrl;
//    imgElement.alt = description;
//    weatherInfo.appendChild(imgElement);
//}

// Function to get weather forecast
//function getWeatherForecast(city) {
    //fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?q=${city}&cnt=7&appid=${apiKey}&units=metric`)
        //.then(response => response.json())
        //.then(data => {
       //     updateForecastChart(data);
        //})
        //.catch(error => console.error('Error fetching forecast data:', error));
//}

// Function to update the forecast chart
//function updateForecastChart(data) {
    //const ctx = document.getElementById('forecastChart').getContext('2d');
    //const labels = data.list.map(item => new Date(item.dt * 1000).toLocaleDateString());
    //const temperatures = data.list.map(item => item.temp.day);

    //new Chart(ctx, {
        //type: 'line',
        //data: {
          //  labels: labels,
          //  datasets: [{
           //     label: 'Temperature (°C)',
           //     data: temperatures,
           //     borderColor: 'rgba(75, 192, 192, 1)',
            //    borderWidth: 1
         //   }]
      //  },
       // options: {
       //     scales: {
       //         y: {
      //              beginAtZero: true
      //          }
     //       }
     //   }
  //  });
//}

// Call the function to get user's location weather on page load

