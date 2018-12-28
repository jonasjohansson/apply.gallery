const sheetUrl = 'http://gsx2json.com/api?id=18tEz0O6i5M51t3EOSG1L5MOa7ofbzJR1awIQbPjAtV4&sheet=1';

const now = new Date();
const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

fetch(sheetUrl)
	.then(function(response) {
		return response.json();
	})
	.then(function(myJson) {
		doData(myJson);
	});

function doData(json) {
	const $entries = document.querySelector('#entries');
	for (let row of json.rows) {
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

		if (dateEnd < dateStart) return;

		const totalDays = calc(dateEnd, dateStart);
		const daysRemaining = calc(now, dateStart);

		let dateStartLocale = dateStart.toLocaleDateString('sv-SE', options);
		let dateEndLocale = dateEnd.toLocaleDateString('sv-SE', options);

		// $dates.innerHTML = `${dateStartLocale} - ${dateEndLocale}`;

		const $entry = document.createElement('div');
		const $link = document.createElement('a');
		const $dates = document.createElement('div');
		const $status = document.createElement('div');
		const $progress = document.createElement('progress');

		$entry.classList.add('entry');
		$dates.classList.add('dates');
		$status.classList.add('status');

		if (now > dateEnd) {
			$entry.classList.add('finished');
		} else if (now > dateStart) {
			$entry.classList.add('ongoing');
		} else {
			$entry.classList.add('upcoming');
		}

		$link.innerHTML = data.name;
		$link.href = data.link;

		$entry.setAttribute('data-start', dateStart);
		$entry.setAttribute('data-end', dateEnd);
		$entry.setAttribute('data-left', daysRemaining);
		$entry.setAttribute('data-days', calc(dateEnd, now));

		$progress.max = 100;
		$progress.value = Math.round((daysRemaining / totalDays) * 100);

		$entry.appendChild($link);
		$entry.appendChild($dates);
		$entry.appendChild($status);
		$entry.appendChild($progress);
		$entries.appendChild($entry);
	}
}

serializeObject = data => {
	var formData = new FormData(data);
	var object = {};
	formData.forEach(function(value, key) {
		object[key] = value;
	});
	return object;
};

function calc(a, b) {
	oneDay = 24 * 60 * 60 * 1000;
	a = a.getTime();
	b = b.getTime();
	val = (a - b) / oneDay;
	return Math.round(val);
}
