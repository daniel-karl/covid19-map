# Open COVID19 Map 🦠😷🗺️

## About

Hi, I'm Daniel Karl 🙋🏻‍♂️

I wanted to see whether I can reproduce the Johns Hopkins map visualization of COVID19. Therefore I set out to build my own version 👨🏻‍💻 using the very same live data source that they kindly provide in their GitHub repo 🙏🏻.

Thanks to the already available data set the process of ramping up a visualization tool in React went fairly smooth ☘️. Since then, https://covid19map.io is getting more and more features:

- project the confirmed cases at global average testing rate 🌍🧪👩🏾‍🔬
- display the momentum of the spread 🦠📈🗺️ in glyphs directly, i.e. change over the last 1, 3 or 7 days
- containment score 🏡😷📉 reflecting the spread of COVID19 in a region, based on weighted average growth of confirmed cases over the past 1, 3 and 7 days.
- replay mode 🎟️🎥🎬 to go back in time (also works in momentum mode)
- works with Johns Hopkins data version 1 and 2 (they changed their format on 03/23/2020)
- normalize data by population 👨‍👩‍👧‍👦📊👫
- is open source ⭐😍🥰, therefore allows other researchers 🔬🧑🏾‍🔬🧬 to study this source code and contribute more features

Please check it out, and hopefully it helps to drive more ideas and to provide a better understanding of the situation we are currently facing. We are all in the same boat ⛵ help each other ❤️ stay healthy!

If you want to contribute a feature I will roll out your pull request timely and add your name here.

## Users
Visit https://covid19map.io

## Developers
### Install and run
```
npm install         # first time only
npm start
```

### Deploy to GitHub pages
```
npm run deploy      # Please do not forget to include link to license and mention the original author(s) as given below
```

### Data model
With:
- `$dataset = this.state.datasource.datasets[$idx]` // 1 per day
- `$data = $dataset.data[$locationName]` // 1 per location
- `$value = {confirmed|active|recovered|deceased|projectedConfirmed}`

Then:
- `$data.absolute.current[$value]`
- `$data.absolute.growthLast1Day[$value]`
- `$data.absolute.growthLast3Days[$value]`
- `$data.absolute.growthLast7Days[$value]`
- `$data.ppm.current[$value]`
- `$data.ppm.growthLast1Day[$value]`
- `$data.ppm.growthLast3Days[$value]`
- `$data.ppm.growthLast7Days[$value]`
- `$data.containmentScore`

Further:
- `$dataset.totalConfirmed`
- `$dataset.totalRecovered`
- `$dataset.totalDeceased`
- `$dataset.totalActive`
- `$dataset.totalConfirmedProjected`
- `$dataset.cameraCoordinates` // for theatre mode

# Contributors
- Daniel Karl 👨🏻‍🔧
- Michael Baentsch 👨🏻‍🏫

## Attributions
### Software dependencies
- [See on GitHub](https://github.com/daniel-karl/covid19-map/network/dependencies)

### Data sources
- [Johns Hopkins COVID-19 data set](https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_time_series)
- Testing rates:
  - [Countries](https://en.wikipedia.org/wiki/COVID-19_testing)
  - [US States](https://docs.google.com/spreadsheets/u/2/d/e/2PACX-1vRwAqp96T9sYYq2-i7Tj0pvTf6XVHjDSMIKBdZHXiCGGdNC0ypEU9NbngS8mxea55JuCFuua1MUeOj5/pubhtml)
- Population data:
  - [US States](https://www.census.gov/newsroom/press-kits/2019/national-state-estimates.html)
  - [Countries](https://population.un.org/wpp/Download/Files/1_Indicators%20(Standard)/CSV_FILES/WPP2019_TotalPopulationBySex.csv)
  - [China](https://www.worldatlas.com/articles/chinese-provinces-by-population.html)
  - [Australia](https://en.wikipedia.org/wiki/States_and_territories_of_Australia)
  - [Diamond Princess](https://www.nytimes.com/2020/03/08/world/asia/coronavirus-cruise-ship.html)

