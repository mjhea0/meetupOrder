var express = require('express');
var router = express.Router();
var https = require('https');
var http = require('http');
var request = require("request");
var webdriver = require('selenium-webdriver');
var By = require('selenium-webdriver').By;

// constants
var meetupBaseURL = 'https://api.meetup.com/2/events?';
var googleBaseURL = 'http://maps.googleapis.com/maps/api/geocode/json?';

// config
var config = require('../_config');
var meetupkey = config.meetupkey;


// get meetup event info
router.get('/data/:id', function(req, res, next) {
  var url = meetupBaseURL + 'key='+meetupkey+'&event_id='+req.params.id+'&sign=true';
  request(url, function(error, data) {
    if (error) {
      res.send("Something went wrong!");
    }
    res.send(JSON.parse(data.body).results[0]);
  });
});


// get zip code based on lat/long
router.post('/zip', function(req, res, next) {
  var url = googleBaseURL + 'latlng='+req.body.lat+','+req.body.lon;
  request(url, function(error, data) {
    if (error) {
      res.send("Something went wrong!");
    }
    res.send(JSON.parse(data.body).results[0].address_components[7].short_name);
  });
});


// scraping code - REFACTOR!
router.post('/data', function(req, res, next){
  var meetupInfo = req.body;
  var username = meetupInfo.user_email;
  var password = meetupInfo.user_password;
  var address = meetupInfo.address_street;
  var city = meetupInfo.address_city;
  var zip = meetupInfo.zip_code;
  var quantity = Math.ceil((((parseInt(meetupInfo.attending)*meetupInfo.expected_ratio)*2)/8)).toString();
  var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();

  //login page
  driver.get('https://denverpizzaco.hungerrush.com/account/logon');
  driver.findElement(By.id('UserName')).sendKeys(username);
  driver.findElement(By.id('Password')).sendKeys(password);
  driver.findElement(By.className('ui-button')).click();
  driver.sleep(3000);

  //order type and address
  driver.findElement(By.className('delivery')).click();
  driver.findElement(By.id('ui-accordion-addressAccord-header-1')).click();
  driver.sleep(3000);
  driver.findElement(By.name('Address.Street')).sendKeys(address);
  driver.findElement(By.name('Address.City')).sendKeys(city);
  driver.findElement(By.name('Address.SelectedState')).sendKeys('CO');
  driver.findElement(By.name('Address.Zip')).sendKeys(zip);
  driver.findElement(By.id('findStore')).click();
  driver.sleep(5000);
  driver.findElement(By.id('ui-id-4')).click();
  driver.sleep(5000);

  //selects cheese
  var x = driver.findElement(webdriver.By.xpath('//*[@id="Pizza"]/div/div/div[1]/div/button/span[2]'));
  x.then(function(cheese){
    cheese.click();
    driver.sleep(5000);

    //selects xlarge
    var y = driver.findElements(By.className('SzPrice'));
    y.then(function(xlarge){
      xlarge[4].click();
      driver.findElement(By.name('i1_mod_m33')).click();
      driver.sleep(3000);

      //selects half pepperoni
      var z = driver.findElements(By.className('mods-h1-active'));
      z.then(function(pepperoni){
        pepperoni[39].click();
        driver.findElement(By.id('i1_qty')).clear();
        driver.findElement(By.id('i1_qty')).sendKeys(quantity);
        driver.sleep(3000);

        //adds to cart
        var k = driver.findElement(By.xpath('/html/body/div[4]/div[3]/div/button/span'));
        k.then(function(add){
          add.click();
          driver.sleep(3000);

          //checkout
          driver.findElement(By.id('lnkCheckout')).click();
          driver.sleep(2000);
          driver.findElement(By.id('CreditCard')).sendKeys(config.cc);
          driver.findElement(By.id('CardHolderName')).sendKeys(config.cardholder);
          driver.findElement(By.id('ExpMonth')).sendKeys(config.expmonth);
          driver.findElement(By.id('ExpYear')).sendKeys(config.expyear);
          driver.findElement(By.id('SecurityCode')).sendKeys(config.csv);
        });
      });
    });
  });
});

module.exports = router;
