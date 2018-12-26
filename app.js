const url = 'https://script.google.com/macros/s/AKfycbxuJ_DJpyx9r04Uz2yaXrlbjyVI6649WngvDC5H8McuGEik3hw_/exec';
const key = '1zceO0JqkSaR9xoogRG0W3p5-bnQ26WPmTQswwBbBwX0';
const url2 = `https://spreadsheets.google.com/feeds/list/${key}/od6/public/values?alt=json-in-script&callback=doData`;

const $form = document.querySelector('form');
const $entries = document.querySelector('#entries');

const now = new Date();
const oneDay = 24 * 60 * 60 * 1000;
const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

$form.addEventListener('submit', e => {
	e.preventDefault();
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'json',
		data: serializeObject($form),
		success: function(data) {
			console.log(data);
		}
	});
});

function doData(json) {
	let entries = json.feed.entry;
	for (let row of entries) {
		let $entry = document.createElement('div');
		$entry.classList.add('entry');
		const name = row['gsx$name'].$t;
		const url = row['gsx$url'].$t;
		let dateStart = row['gsx$date-start'].$t || 0;
		let dateEnd = row['gsx$date-end'].$t;

		$entry.setAttribute('data-start', dateStart);
		$entry.setAttribute('data-end', dateEnd);

		dateStart = new Date(dateStart);
		dateEnd = new Date(dateEnd);

		let dates = getDays(dateStart, dateEnd);

		let $link = document.createElement('a');
		$link.innerHTML = name;
		$link.href = url;

		let $dates = document.createElement('span');
		$dates.classList.add('dates');

		let dateStartLocale = dateStart.toLocaleDateString('sv-SE', options);
		let dateEndLocale = dateEnd.toLocaleDateString('sv-SE', options);

		$dates.innerHTML = `${dateStartLocale} - ${dateEndLocale}`;

		let $progress = document.createElement('progress');
		$progress.max = 100;
		$progress.value = Math.round((dates[1] / dates[0]) * 100);

		console.log(dateStart, now);

		if (dateStart > now) $progress.classList.add('will-start');

		$entry.appendChild($link);
		$entry.appendChild($dates);
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

const getDays = (a, b) => {
	total = calc(b, a);
	days = calc(now, a);
	return [total, days];
};

function calc(a, b) {
	a = a.getTime();
	b = b.getTime();
	return Math.round((a - b) / oneDay);
}
