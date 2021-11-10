
import './App.css';
import {
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
} from '@material-ui/core';
import { useEffect, useState } from 'react';
import InfoBox from './InfoBox';
import Table from './Table'
import { sortData, prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import Maps from './Maps';
import numeral from "numeral";
import "leaflet/dist/leaflet.css";


function App() {
  // https://disease.sh/v3/covid-19/countries
  // https://disease.sh/v3/covid-19/all

  const [countries, setCounries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data)
    })
  },[]);

  useEffect(()=>{

    const getCountriesData = async() => {
      await fetch('https://disease.sh/v3/covid-19/countries')
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ));
        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data)
        setCounries(countries);
      })
    };

    getCountriesData();

  },[]);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);
    // console.log('country>>>', countryCode);

    const url = 
    countryCode === 'worldwide' 
    ? 'https://disease.sh/v3/covid-19/all' 
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode); 
      setCountryInfo(data)

      if (countryCode !== 'worldwide') {
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(5);
      } else {
        setMapCenter([30, -18]);
        setMapZoom(2);
      }
    });
    // https://disease.sh/v3/covid-19/countries/[COUNTRY_CODE]
  };

  console.log('info>>',countryInfo)
  return (
    <div className="app">
      <div className='app__left'>

        <div className='app__header'>
          <h1>Covid-19 TRACKER</h1>
          <FormControl>
            <Select
              variant='outlined'
              onChange={onCountryChange}
              value={country}
            >
            <MenuItem value='worldwide'>Worldwide</MenuItem>
            {
              countries.map(country => (
                <MenuItem value={country.value}>
                  {country.name}
                </MenuItem>
              ))
            }
            </Select>
          </FormControl>
        </div>
        <div className='app__stats'>

            <InfoBox  
              isRed
              active={casesType === "cases"}
              onClick={(e) => setCasesType("cases")} 
              title='Coronavirus Cases'  
              cases={prettyPrintStat(countryInfo.todayCases)} 
              total={numeral(countryInfo.cases).format("0.0a")} />
            <InfoBox  
              onClick={(e) => setCasesType("recovered")}
              active={casesType === "recovered"} 
              title='Recovered'  cases={prettyPrintStat(countryInfo.todayRecovered)} total={numeral(countryInfo.recovered).format("0.0a")}  />
            <InfoBox   
              isRed
              onClick={(e) => setCasesType("deaths")} 
              active={casesType === "deaths"}
              title='Deaths'  
              cases={prettyPrintStat(countryInfo.todayDeaths)} 
              total={numeral(countryInfo.deaths).format("0.0a")}/>
        </div>
      <Maps 
        casesType={casesType}
        countries={mapCountries}
        center={mapCenter}
        zoom={mapZoom}
      />
      </div>
      <Card className='app__right'>
          <CardContent>
          <div className="app__information">
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3>Worldwide new {casesType}</h3>
            <LineGraph casesType={casesType} />
          </div>
          </CardContent>
      </Card>
    </div>
  );
}

export default App;
