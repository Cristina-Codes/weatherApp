//Note - this was designed with USA zip codes in mind


//namespacing
const app = {}

app.key = 'VAwukrGRJGrr2X1B9V9AJBjcPi5p8Mdk';
//50 calls per 24 hours with free API

const $results = $('.results');
const $rainVideo = $('.rainVideo');
const $snowVideo = $('.snowVideo');
const $body = $('body');

//User Input (postal code) to find the city ID
app.getCityId = (query) => {
  $.ajax({ 
    url: 'http://dataservice.accuweather.com/locations/v1/cities/search',
    method:'GET',
    dataType: 'json', //jsonp?
    data: {
      apikey: app.key,
      q: query
    }
  }).then(function(data) {
    $('.results').empty();
    data.forEach(city => {
      const country = city.Country.ID;
      if(country == "US"){ //it looked across US, Canada and Mexico initially
        const UScity = city.Key;
        app.findWeather(UScity);
        const htmlToAppend = `
        <div class="result">
          <h4 class="${city.Key}">${city.LocalizedName}</h4>
        </div>
        `;
        $results.append(htmlToAppend);
      }
    });
  });
};

app.findWeather = (UScity) => {
  $.ajax({
    url: `http://dataservice.accuweather.com/currentconditions/v1/${UScity}`,
    method: 'GET',
    dataType: 'json',
    data: {
      apikey: app.key
    }
  }).then((weatherRes) => {
    const weatherObj = weatherRes[0];
    const precip = weatherObj.PrecipitationType;
    const isDaytime = weatherObj.IsDayTime;
    const weatherType = weatherObj.WeatherText;
    const temp = weatherObj.Temperature.Imperial.Value;
    app.printWeather(precip, isDaytime, weatherType, temp)
  }); 
}


app.printWeather = (precip, isDaytime, weatherType, temp) => {
  const htmlToAppend = `
  <div class="weather">
    <p class="temperature">${temp}&deg;</p>
    <p class="weatherType">${weatherType}</p>
  </div>
  `;
  $results.append(htmlToAppend);
  if(isDaytime === false){
    clearClasses($body);
    $body.addClass('night');
  };
  if(precip === 'Rain' || precip === 'Mixed'){
    clearClasses($body);
    $rainVideo.css('display', 'block');
  }else if(precip === 'Snow' || precip === 'Ice'){
    clearClasses($body);
    $snowVideo.css('display', 'block');
  };
  if(weatherType === 'Mostly sunny' || weatherType === 'Sunny' || weatherType === 'Partly sunny'){
    clearClasses($body);
    $body.addClass('sunny');
  }else if(weatherType === 'Mostly cloudy' || weatherType === 'Cloudy' || weatherType === 'Partly cloudy'){
    clearClasses($body);
    $body.addClass('cloudy');
  }else if(weatherType === 'Haze' || weatherType === 'Fog'){
    clearClasses($body);
    $body.addClass('hazy');
  }
} 

const clearClasses = (element) => {
  element.removeClass('starterBackground');
  element.removeClass('night');
  element.removeClass('cloudy');
  element.removeClass('sunny');
  element.removeClass('hazy');
  $rainVideo.css('display', 'none');
  $snowVideo.css('display', 'none');
}
  

app.init = () => {
  $('form').on('submit', function(event){
    event.preventDefault();
    const location = $('#location').val();
    app.getCityId(location);
  });
};


//init
$(function () {
  app.init();
});