const url = 'https://script.google.com/macros/s/AKfycbxuJ_DJpyx9r04Uz2yaXrlbjyVI6649WngvDC5H8McuGEik3hw_/exec';
const key = '1zceO0JqkSaR9xoogRG0W3p5-bnQ26WPmTQswwBbBwX0';
const url2 = `https://spreadsheets.google.com/feeds/list/${key}/od6/public/values?alt=json-in-script&callback=doData`;

const $form = document.querySelector('form');
const $entries = document.querySelector('#entries');

const now = new Date('2018/12/04');
const oneDay = 24 * 60 * 60 * 1000;

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
		const dateStart = row['gsx$date-start'].$t;
		const dateEnd = row['gsx$date-end'].$t;

		let dates = getDays(dateStart, dateEnd);

		$entry.setAttribute('data-start', dateStart);
		$entry.setAttribute('data-end', dateEnd);

		let $link = document.createElement('a');
		$link.innerHTML = name;
		$link.href = url;

		let $dates = document.createElement('span');
		$dates.classList.add('dates');
		$dates.innerHTML = `${dateStart} - ${dateEnd}`;

		let $progress = document.createElement('progress');
		$progress.max = 100;
		$progress.value = (dates[1] / dates[0]) * 100;

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
	a = new Date(a);
	b = new Date(b);
	total = calc(b, a);
	days = calc(now, a);
	return [total, days];
};

function calc(a, b) {
	a = a.getTime();
	b = b.getTime();
	return Math.round((a - b) / oneDay);
}
