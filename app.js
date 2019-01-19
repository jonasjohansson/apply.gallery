const now = new Date();
const options = { timeZone: 'Europe/Stockholm', weekday: 'short', month: 'short', day: 'numeric' };

parseGSX('18tEz0O6i5M51t3EOSG1L5MOa7ofbzJR1awIQbPjAtV4');

function display(data) {
	document.documentElement.classList.remove('loading');
	const $entries = document.querySelector('#entries');
	data.sort(mysort);
	data.reverse();

	for (let row of data) {
		const data = {
			name: row['name'],
			org: row['organisation'] || '',
			link: row['link'],
			country: row['country'],
			start: row['start'],
			end: row['end']
		};

		if (data.link === '') data.link = `http://www.google.com/search?q=${data.org} ${data.name}`;

		const dateStart = new Date(data.start);
		const dateEnd = new Date(data.end);

		const totalDays = calc(dateEnd, dateStart);
		const daysRemaining = calc(dateEnd, now);

		let dateStartLocale = dateStart.toLocaleDateString('sv-SE', options);
		let dateEndLocale = dateEnd.toLocaleDateString('sv-SE', options);

		const $entry = document.createElement('div');
		const $link = document.createElement('a');
		const $date = document.createElement('div');
		const $state = document.createElement('div');
		const $progress = document.createElement('progress');

		$entry.classList.add('entry');
		$date.classList.add('date');
		$state.classList.add('state');

		$link.innerHTML = data.org !== '' ? `${data.org}: ${data.name}` : data.name;
		$link.innerHTML = `<span>${$link.innerHTML}</span>`;
		$link.href = data.link;

		if (now > dateEnd) {
			data.state = 'finished';
			$state.innerHTML = 'avslutad';
		} else if (now > dateStart) {
			data.state = 'running';
			$state.innerHTML = `${daysRemaining + 1}`;
			if (daysRemaining > 1) {
				$state.innerHTML += ' dagar kvar';
			} else {
				$state.innerHTML += ' dag kvar';
			}
		} else {
			data.state = 'upcoming';
			$state.innerHTML = 'kommande';
		}

		$date.innerHTML = `${dateStartLocale} - ${dateEndLocale}`;

		$entry.classList.add(data.state);

		$progress.max = 100;
		$progress.value = Math.round((daysRemaining / totalDays) * 100);

		$entry.appendChild($link);
		$entry.appendChild($date);
		$entry.appendChild($state);
		$entry.appendChild($progress);
		$entries.appendChild($entry);
	}

	for (let a of document.querySelectorAll('a')) a.target = '_blank';
}

function calc(a, b) {
	oneDay = 24 * 60 * 60 * 1000;
	a = a.getTime();
	b = b.getTime();
	val = (a - b) / oneDay;
	return Math.round(val);
}

function mysort(a, b) {
	as = new Date(a.start);
	bs = new Date(b.start);
	ae = new Date(a.end);
	be = new Date(b.end);

	if (now > ae) a.state = 0;
	// finished
	else if (now < as) a.state = 1;
	// incoming
	else a.state = 2; // running

	if (now > be) b.state = 0;
	else if (now < bs) b.state = 1;
	else b.state = 2;

	if (a.state > b.state) return 1;
	if (a.state < b.state) return -1;

	if (as > bs) return 1;
	if (as < bs) return -1;
}

function parseGSX(spreadsheetID) {
	var url = 'https://spreadsheets.google.com/feeds/list/' + spreadsheetID + '/1/public/values?alt=json';
	var ajax = $.ajax(url);
	$.when(ajax).then(parseRawData);
}

function parseRawData(res) {
	var data = [];
	res.feed.entry.forEach(function(entry) {
		var parsedObject = {};
		for (var key in entry) {
			if (key.substring(0, 4) === 'gsx$') {
				parsedObject[key.slice(4)] = entry[key]['$t'];
			}
		}
		data.push(parsedObject);
	});
	display(data);
}
