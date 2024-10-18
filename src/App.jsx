
import { useEffect } from 'react';
import $ from 'jquery';
window.$ = $;
import 'bootstrap/dist/css/bootstrap.css'
import codegrid from './assets/codegrid.js';

function App() {
  useEffect(() => {
    var grid = codegrid.CodeGrid(); // initialize

    $("#btnSearch").on("click", () => {
      let text = document.querySelector("#txtSearch").value;
      document.querySelector("#details").style.opacity = 0;
      document.querySelector("#loading").style.display = "block";
      getCountry(text);
    });

    // Detect Location
    $("#btnLocation").on("click", () => {
      document.querySelector("#loading").style.display = "block";
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async function onSuccess(position) {
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;

            grid.getCode(lat, lng, async function (err, code) {
              try {
                const response = await fetch('https://restcountries.com/v3.1/alpha/' + code);
                if (!response.ok)
                  throw new Error("Your Location Not Found!");
                const data = await response.json();
                renderCountry(data[0]);

                const countries = data[0].borders;
                if (!countries)
                  throw new Error("Neighbor Country Not Found!");

                const response2 = await fetch('https://restcountries.com/v3.1/alpha?codes=' + countries.toString());
                const neighbors = await response2.json();

                renderNeighbors(neighbors);
              }
              catch (err) {
                renderError(err);
              }
            });
          }, function onError(err) {
            renderError(err);
            document.querySelector("#loading").style.display = "none";
          });
      }
    });

    async function getCountry(country) {
      try {
        if (!country) {
          throw new Error("Please enter a country");
        } else {
          const response = await fetch('https://restcountries.com/v3.1/name/' + country);
          if (!response.ok) {
            throw new Error("Country not found!");
          } else {
            const data = await response.json();
            renderCountry(data[0]);

            const countries = data[0].borders;
            if (!countries)
              throw new Error("Neighbor country not found!");

            const response2 = await fetch('https://restcountries.com/v3.1/alpha?codes=' + countries.toString());
            const neighbors = await response2.json();

            renderNeighbors(neighbors);
          }
        }
      }
      catch (err) {
        renderError(err);
      }
    }

    function renderCountry(data) {
      document.querySelector("#loading").style.display = "none";
      document.querySelector("#country-details").innerHTML = "";
      document.querySelector("#neighbors").innerHTML = "";

      let html = `                   
                <div class="col-4">
                    <img src="${data.flags.png}" alt="" class="img-fluid">
                </div>
                <div class="col-8">
                    <h3 class="card-title">${data.name.common}</h3>
                    <hr>
                    <div class="row">
                        <div class="col-4">Population: </div>
                        <div class="col-8">${(data.population / 1000000).toFixed(1)} milyon</div>
                    </div>
                    <div class="row">
                        <div class="col-4">Official Language: </div>
                        <div class="col-8">${Object.values(data.languages)}</div>
                    </div>
                    <div class="row">
                        <div class="col-4">Capital City: </div>
                        <div class="col-8">${data.capital[0]}</div>
                    </div>
                    <div class="row">
                        <div class="col-4">Currency: </div>
                        <div class="col-8">${Object.values(data.currencies)[0].name} (${Object.values(data.currencies)[0].symbol})</div>
                    </div>
                </div>
        `;

      document.querySelector("#details").style.opacity = 1;
      document.querySelector("#country-details").innerHTML = html;
    }

    function renderNeighbors(data) {
      let html = "";
      for (let country of data) {
        html += `
                <div class="col-2 mt-2">
                    <div class="card">
                        <img src="${country.flags.png}" class="card-img-top">
                        <div class="card-body">
                            <h6 class="card-title">${country.name.common}</h6>
                        </div>
                    </div>
                </div>
            `;

      }
      document.querySelector("#neighbors").innerHTML = html;
    }

    function renderError(err) {
      document.querySelector("#loading").style.display = "none";
      const html = `
            <div class="alert alert-danger">
                ${err.message}
            </div>
        `;
      setTimeout(function () {
        document.querySelector("#errors").innerHTML = "";
      }, 3000);
      document.querySelector("#errors").innerHTML = html;
    }
  });
  return (
    <div className="container my-4">
      <h4 className='w-full text-center mb-4'>GET LOCATION</h4>
      <div className="card mb-3">
        <div className="card-body d-flex align-items-center">
          <button id="btnLocation" type="button" className="btn btn-danger d-flex text-nowrap justify-content-center align-items-center">
            Get Location &nbsp;&nbsp;&nbsp;<i className="fa-solid fa-location-crosshairs"></i>
            <div id="loading">
              <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
            </div>
          </button>&nbsp;&nbsp;&nbsp;
          <span>OR</span>&nbsp;&nbsp;&nbsp;
          <div className="input-group">
            <input id="txtSearch" type="text" placeholder="Turkey, France, Russia" className="form-control" />
            <button id="btnSearch" type="button" className="btn btn-primary">Search Country</button>
          </div>
        </div>
      </div>
      <div id="details">
        <div className="card mb-3">
          <div className="card-header">Search Result</div>
          <div className="card-body">
            <div className="row" id="country-details">

            </div>
          </div>
        </div>
        <div className="card mb-3">
          <div className="card-header">Neighbor Countries</div>
          <div className="card-body">
            <div className="row" id="neighbors">

            </div>
          </div>
        </div>
      </div>
      <div id="errors" className='text-center w-full'></div>
    </div>
  )
}

export default App
