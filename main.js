const API_KEY = '17fcd7577118002fbd3187179fc8ad61';

(async ($d3, $moment, $document, $Tabulator) => {
  const rangeOfYears = (start, end) =>
    Array(end - start + 1)
      .fill(start)
      .map((year, index) => year + index);

  const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };

  const createLoadingAnimation = () => {
    const loadingAnimation = $d3.create('div').attr('class', 'lds-facebook');
    loadingAnimation.append('div');
    loadingAnimation.append('div');
    loadingAnimation.append('div');
    return loadingAnimation;
  };
  const onYearChange = (d) => {
    console.log('event', d.value);
  };
  // create loading animation

  const minYear = 1950;
  const maxYear = new Date().getFullYear();

  const yearSelect = $d3
    .select('#year')
    .append('select')
    .attr('id', 'yearSelect')
    .on('change', function (event) {
      const currentYear = document.getElementById('yearSelect').value;
      //   console.log(currentYear);
      getMovieDataForYear(currentYear);
    });

  yearSelect
    .selectAll('option')
    .data(rangeOfYears(minYear, maxYear).reverse())
    .enter()
    .append('option')
    .text(function (d) {
      return d;
    })
    .text(function (d) {
      return d;
    });

  const months = $moment.monthsShort();

  const getMovieDataForYear = async (year) => {
    console.log('getMovieDataForYear', months);

    // clear
    $d3.select('#months').html('');
    $d3.select('#movieData').html('');

    const monthsElement = $d3.select('#months');
    monthsElement
      .selectAll('div')
      .data(months)
      .enter()
      .append('a')
      .attr('class', 'month-name')
      .attr('href', function (d) {
        return `#${d}-${year}`;
      })
      .text(function (d) {
        return d;
      });

    await asyncForEach(months, async (month, index) => {
      const movieDataElement = $d3.select('#movieData').append('div');
      movieDataElement.append(() => createLoadingAnimation().node());

      const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&region=US&with_release_type=3|2&primary_release_date.gte=${year}-${(
        '0' +
        (index + 1)
      ).slice(-2)}-01&primary_release_date.lte=${year}-${(
        '0' +
        (index + 1)
      ).slice(-2)}-31`;
      console.log('url', url);
      const movieData = await $d3.json(url);
      console.log('movieData', movieData);
      movieDataElement.selectAll('.lds-facebook').remove();
      const monthDiv = $d3
        .select('#movieData')
        .append('div')
        .attr('id', `${month}-${year}`)
        .attr('class', 'month-container');

      const header = monthDiv.append('h2').text(`${month}-${year}`);
      const table = monthDiv
        .append('table')
        .style('border-collapse', 'collapse')
        .style('border', '2px black solid')
        .attr('class', 'movie-table');
      const desiredHeaders = [
        'id',
        'title',
        'release_date',
        'vote_count',
        'vote_average',
      ];
      const filteredMovieData = movieData.results.map((d) => {
        return desiredHeaders.reduce((acc, curr) => {
          acc[curr] = d[curr];
          return acc;
        }, {});
      });
      console.log('filteredMovieData', filteredMovieData);
      table
        .append('thead')
        .append('tr')
        .selectAll('th')
        .data(desiredHeaders)
        .enter()
        .append('th')
        .text(function (d) {
          return d;
        })
        .style('border', '1px black solid')
        .style('padding', '5px')
        .style('background-color', 'lightgray')
        .style('font-weight', 'bold')
        .style('text-transform', 'uppercase');

      // data
      table
        .append('tbody')
        .selectAll('tr')
        .data(filteredMovieData)
        .enter()
        .append('tr')
        .selectAll('td')
        .data(function (d) {
          console.log('filteredMovieData: d', d);
          return Object.keys(d).map((key) => d[key]);
        })
        .enter()
        .append('td')
        .style('border', '1px black solid')
        .style('padding', '5px')
        .on('mouseover', function () {
          $d3.select(this).style('background-color', 'powderblue');
        })
        .on('mouseout', function () {
          $d3.select(this).style('background-color', 'white');
        })
        .text(function (d) {
          console.log('get each d', d);
          return d;
        })
        .style('font-size', '12px');
    });
  };
  await getMovieDataForYear(2020);
})(d3, moment, document);
