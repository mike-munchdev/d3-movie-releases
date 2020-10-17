const API_KEY = '17fcd7577118002fbd3187179fc8ad61';

(async ($d3, $genres, $months, $headers) => {
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

  // create loading animation

  const minYear = 1950;
  const maxYear = new Date().getFullYear();

  // create year select list
  $d3
    .select('#year')
    .append('span')
    .attr('class', 'select-label')
    .text('Select Year:');

  const yearSelect = $d3
    .select('#year')
    .append('select')
    .attr('id', 'yearSelect')
    .on('change', function (event) {
      const currentGenre = document.getElementById('genreSelect').value;
      const currentYear = document.getElementById('yearSelect').value;
      getMovieDataForYear(currentYear, currentGenre);
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

  // create genre select list
  $d3
    .select('#genre')
    .append('span')
    .attr('class', 'select-label')
    .text('Select Genre:');

  const genreSelect = $d3
    .select('#genre')
    .append('select')
    .attr('id', 'genreSelect')
    .on('change', function (event) {
      const currentGenre = document.getElementById('genreSelect').value;
      const currentYear = document.getElementById('yearSelect').value;
      getMovieDataForYear(currentYear, currentGenre);
    });

  genreSelect
    .selectAll('option')
    .data($genres)
    .enter()
    .append('option')
    .text(function (d) {
      return d.name;
    })
    .attr('value', function (d) {
      return d.id;
    });

  const getMovieDataForYear = async (year, genre) => {
    // clear
    $d3.select('#months').html('');
    $d3.select('#movieData').html('');

    const monthsElement = $d3.select('#months');

    monthsElement
      .selectAll('div')
      .data($months)
      .enter()
      .append('a')
      .attr('class', 'month-name')
      .attr('href', function (d) {
        return `#${d}-${year}`;
      })
      .text(function (d) {
        return d;
      });

    await asyncForEach($months, async (month, index) => {
      const movieDataElement = $d3.select('#movieData').append('div');
      try {
        movieDataElement.append(() => createLoadingAnimation().node());

        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}${
          genre ? `&with_genres=${genre}` : ''
        }&region=US&with_release_type=3|2&primary_release_date.gte=${year}-${(
          '0' +
          (index + 1)
        ).slice(-2)}-01&primary_release_date.lte=${year}-${(
          '0' +
          (index + 1)
        ).slice(-2)}-31`;

        const movieData = await $d3.json(url);

        movieDataElement.selectAll('.lds-facebook').remove();
        const monthDiv = $d3
          .select('#movieData')
          .append('div')
          .attr('id', `${month}-${year}`)
          .attr('class', 'month-container');

        const monthDivHeader = monthDiv
          .append('div')
          .attr('class', 'month-header');
        monthDivHeader
          .append('div')
          .attr('class', 'header-container')
          .append('h2')
          .text(`${month} ${year}`);

        monthDivHeader.append('a').attr('href', '#top').text('top');

        const table = monthDiv
          .append('table')
          .style('border-collapse', 'collapse')
          .style('border', '2px black solid')
          .attr('class', 'movie-table');

        const filteredMovieData = movieData.results.map((d) => {
          return $headers.reduce((acc, curr) => {
            acc[curr] = d[curr];
            return acc;
          }, {});
        });

        // add table headers
        table
          .append('thead')
          .append('tr')
          .selectAll('th')
          .data($headers)
          .enter()
          .append('th')
          .text(function (d) {
            return d === 'genre_ids' ? 'genres' : d.replace('_', ' ');
          })
          .style('border', '1px black solid')
          .style('padding', '5px')
          .style('background-color', 'lightgray')
          .style('font-weight', 'bold')
          .style('text-transform', 'uppercase');

        // add table data
        table
          .append('tbody')
          .selectAll('tr')
          .data(filteredMovieData)
          .enter()
          .append('tr')
          .selectAll('td')
          .data(function (d) {
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
          .text(function (d, index) {
            return index === $headers.length - 1
              ? d.map((i) => $genres.find((g) => g.id === i).name).join(', ')
              : d;
          })
          .style('font-size', '12px');
      } catch (error) {
        // display error
        movieDataElement.selectAll('.lds-facebook').remove();
        $d3
          .select('#movieData')
          .append('h2')
          .text(`${month}-${year} - Error Retrieving Data`);
      }
    });
  };

  // get initial data
  await getMovieDataForYear(2020, $genres[0].id);
})(d3, genres, months, desiredHeaders);
