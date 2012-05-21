function BalloonFind(email, balloonId, lat, lng, captchaChallenge, captchaResponse)
{
	this.email = email;
	this.id = balloonId;
	this.lat = lat;
	this.lng = lng;
	this.captchaChallenge = captchaChallenge;
	this.captchaResponse = captchaResponse;
}

//exports.balloonFind = BalloonFind;