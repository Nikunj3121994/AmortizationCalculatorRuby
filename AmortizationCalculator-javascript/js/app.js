var user = {
	email:'',
	loanAmount:0,
	rateOfInterest:0,
	initialPaymentDate:{
		month:0,
		year:0
	},
	tenure:0,
	current_month:0,
	current_year:0,
	opening_amount:0,
	current_interest:0,
	total_paid_interest:0, 
	current_principal:0, 
	closing_amount:0, 
	monthlyEmi:0
}

/**
function to calculate the emi initially after the submission of details
*/
function submitAmortizationCalculation(){
	user.email = document.getElementById("email").value;
	user.loanAmount = parseFloat(document.getElementById("loan_amount").value);
	user.closing_amount = user.loanAmount;
	user.opening_amount = user.loanAmount;
	user.rateOfInterest = Number((document.getElementById("interest_rate").value)/100);
	monthlyInterestRate = user.rateOfInterest / 12;
	user.tenure = Number(document.getElementById("tenure").value);
	user.initialPaymentDate.month=Number(document.getElementById("initial_payment_month").value);
	user.initialPaymentDate.year=Number(document.getElementById("initial_payment_year").value);
	user.current_month=user.initialPaymentDate.month;
	user.current_year=user.initialPaymentDate.year;
	user.monthlyEmi = ((user.loanAmount * monthlyInterestRate * Math.pow((1 + monthlyInterestRate),(user.tenure*12)))/(Math.pow((1 + monthlyInterestRate),(user.tenure*12)) - 1)).toFixed(2);

	if(document.getElementById("check_annual_payment").checked){
		user.annualPayment={
			status : false,
			startingDate:{
				month:0,
				year:0
			},
			amount:0,
			noOfPayments:0,
			paymentsAlreadyCounted:0
		};
		user.annualPayment.startingDate.month = Number(document.getElementById("annual_payment_month").value);
		user.annualPayment.startingDate.year = Number(document.getElementById("annual_payment_year").value);
		user.annualPayment.amount = Number(document.getElementById("annual_payment_amount").value).toFixed(2);
		user.annualPayment.noOfPayments = document.getElementById("annual_no_of_payments").value;
	}else{
		user.annualPayment = null;
	}
	if(document.getElementById("check_monthly_payment").checked){
		user.monthlyPayment={
			status : false,
			startingDate:{
				month:0,
				year:0
			},
			amount:0,
			endingDate:{
				month:0,
				year:0
			}
		};
		user.monthlyPayment.startingDate.month = Number(document.getElementById("monthly_payment_start_month").value);
		user.monthlyPayment.startingDate.year = Number(document.getElementById("monthly_payment_start_year").value);
		user.monthlyPayment.amount = Number(document.getElementById("monthly_payment_amount").value).toFixed(2);
		user.monthlyPayment.endingDate.month = document.getElementById("monthly_payment_end_month").value;
		user.monthlyPayment.endingDate.year = document.getElementById("monthly_payment_end_year").value;
	}else{
		user.monthlyPayment = null;
	}
	if(document.getElementById("check_one_time_payment").checked){
		user.oneTimePayment={
			status : false,
			paymentDate:{
				month:0,
				year:0
			},
			amount:0
		};
		user.oneTimePayment.paymentDate.month = Number(document.getElementById("one_time_payment_month").value);
		user.oneTimePayment.paymentDate.year = Number(document.getElementById("one_time_payment_year").value);
		user.oneTimePayment.amount = Number(document.getElementById("one_time_payment_amount").value).toFixed(2);
	}else{
		user.oneTimePayment = null;
	}
	//show the amortization table
	document.getElementById("ams").style.display = 'block';
	fillAmortizationSchedule(user);
	//save in DB
	//var ref = new Firebase("https://burning-inferno-3600.firebaseio.com/users");
	var usersRef = new Firebase("https://burning-inferno-3600.firebaseio.com/users/");
	usersRef.push(user);
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "http://localhost:4567/api/user-calculations", true);
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.setRequestHeader("Access-Control-Allow-Origin","*");
	xhttp.send(JSON.stringify(user));
	return true;
}

function fillAmortizationSchedule(user){
	var tbody = document.getElementById("ams_body");
	var innerTable = "";
	while(user.closing_amount>0){
		innerTable = innerTable + findCurrentMonthAmortization(user);
	}
	document.getElementById("ams").style.display = 'block';
	tbody.innerHTML = innerTable;
}

function findCurrentMonthAmortization(userCalculation){
	userCalculation.opening_amount = userCalculation.closing_amount;
	userCalculation.current_interest = Number(userCalculation.closing_amount * userCalculation.rateOfInterest / 12).toFixed(2);
	userCalculation.total_paid_interest = Number(Number(userCalculation.total_paid_interest) + Number(userCalculation.current_interest)).toFixed(2);
	userCalculation.current_principal = Number(userCalculation.monthlyEmi - userCalculation.current_interest).toFixed(2);
	
	userCalculation.closing_amount = Number(userCalculation.closing_amount - userCalculation.current_principal).toFixed(2);
	if(userCalculation.closing_amount<0){
		//if the closing amount is less than 0 then the amount paid in this month 
		//would decrease
		//in a way affecting the whole calculation
		//for the last month
		userCalculation.current_principal = Number(userCalculation.opening_amount).toFixed(2);
	
		userCalculation.closing_amount = Number(userCalculation.opening_amount - userCalculation.current_principal).toFixed(2);
	}
	var tableRow = tableRow + "<tr>";
	tableRow="<td>"+userCalculation.current_month+"</td>"
				+"<td>"+userCalculation.current_year+"</td>"
				+"<td>"+userCalculation.opening_amount+"</td>"
				+"<td>"+userCalculation.current_interest+"</td>"
				+"<td>"+userCalculation.total_paid_interest+"</td>"
				+"<td>"+userCalculation.current_principal+"</d>"
				+"<td>"+userCalculation.closing_amount+"</td>";
	tableRow = tableRow + "</tr>";
	//for annual payments
	//if the annual Payments are entered and 
	//current month is equal to the starting month
	//and noOfPayments are not yet fully done
	if(userCalculation.annualPayment!=null && 
		userCalculation.current_year >= userCalculation.annualPayment.startingDate.year &&
		userCalculation.current_month==userCalculation.annualPayment.startingDate.month
		&& userCalculation.annualPayment.paymentsAlreadyCounted < userCalculation.annualPayment.noOfPayments){
		userCalculation.opening_amount = userCalculation.closing_amount;
		userCalculation.current_principal = Number(userCalculation.annualPayment.amount).toFixed(2);

		userCalculation.closing_amount = Number(userCalculation.closing_amount - userCalculation.current_principal).toFixed(2);
		if(userCalculation.closing_amount<0){
			//if the closing amount is less than 0 then the amount paid in this month 
			//would decrease
			//in a way affecting the whole calculation
			//for the last month
			userCalculation.current_principal = Number(userCalculation.opening_amount).toFixed(2);
		
			userCalculation.closing_amount = Number(userCalculation.opening_amount - userCalculation.current_principal).toFixed(2);
		}
		tableRow = tableRow + "<tr>";
		tableRow = tableRow + "<td>"+userCalculation.current_month+"</td>"
				+"<td>"+userCalculation.current_year+"</td>"
				+"<td>"+userCalculation.opening_amount+"</td>"
				+"<td>"+0+"</td>"
				+"<td>"+0+"</td>"
				+"<td>"+userCalculation.current_principal+"</td>"
				+"<td>"+userCalculation.closing_amount+"</td>";
		tableRow = tableRow + "</tr>";
	}

	//for monthly payments
	//if the monthly Payments are entered and 
	//current month and year is >= than the starting month and year
	//current month and year is <= than the ending month and year
	//formula used to compare is year*100+month
	if(userCalculation.monthlyPayment!=null && 
		(((userCalculation.current_year * 100) + userCalculation.current_month)>=Number(Number(userCalculation.monthlyPayment.startingDate.year * 100) + Number(userCalculation.monthlyPayment.startingDate.month))) &&
		(((userCalculation.current_year * 100) + userCalculation.current_month)<=Number(Number(userCalculation.monthlyPayment.endingDate.year * 100) + Number(userCalculation.monthlyPayment.endingDate.month)))){
		userCalculation.opening_amount = userCalculation.closing_amount;
		userCalculation.current_principal = Number(userCalculation.monthlyPayment.amount).toFixed(2);
		userCalculation.closing_amount = Number(userCalculation.closing_amount - userCalculation.current_principal).toFixed(2);
		if(userCalculation.closing_amount<0){
			//if the closing amount is less than 0 then the amount paid in this month 
			//would decrease
			//in a way affecting the whole calculation
			//for the last month
			userCalculation.current_principal = Number(userCalculation.opening_amount).toFixed(2);
		
			userCalculation.closing_amount = Number(userCalculation.opening_amount - userCalculation.current_principal).toFixed(2);
		}
		tableRow = tableRow + "<tr>";
		tableRow = tableRow + "<td>"+userCalculation.current_month+"</td>"
				+"<td>"+userCalculation.current_year+"</td>"
				+"<td>"+userCalculation.opening_amount+"</td>"
				+"<td>"+0+"</td>"
				+"<td>"+0+"</td>"
				+"<td>"+userCalculation.current_principal+"</td>"
				+"<td>"+userCalculation.closing_amount+"</td>";
		tableRow = tableRow + "</tr>";
	}

	//for one time paymernt
	//just compare the month and year
	if(userCalculation.oneTimePayment!=null && 
		userCalculation.current_year == userCalculation.oneTimePayment.paymentDate.year &&
		userCalculation.current_month==userCalculation.oneTimePayment.paymentDate.month){
		userCalculation.opening_amount = userCalculation.closing_amount;
		userCalculation.current_principal = Number(userCalculation.oneTimePayment.amount).toFixed(2);
		userCalculation.closing_amount = Number(userCalculation.closing_amount - userCalculation.current_principal).toFixed(2);
		if(userCalculation.closing_amount<0){
			//if the closing amount is less than 0 then the amount paid in this month 
			//would decrease
			//in a way affecting the whole calculation
			//for the last month
			userCalculation.current_principal = Number(userCalculation.opening_amount).toFixed(2);
		
			userCalculation.closing_amount = Number(userCalculation.opening_amount - userCalculation.current_principal).toFixed(2);
		}
		tableRow = tableRow + "<tr>";
		tableRow = tableRow + "<td>"+userCalculation.current_month+"</td>"
				+"<td>"+userCalculation.current_year+"</td>"
				+"<td>"+userCalculation.opening_amount+"</d>"
				+"<td>"+0+"</td>"
				+"<td>"+0+"</td>"
				+"<td>"+userCalculation.current_principal+"</td>"
				+"<td>"+userCalculation.closing_amount+"</td>";
		tableRow = tableRow + "</tr>";
	}

	//increment the month and year
	if(userCalculation.current_month==12){
		userCalculation.current_month = 1;
		userCalculation.current_year = userCalculation.current_year + 1;
	}else{
		userCalculation.current_month = userCalculation.current_month+1;
	}
	return tableRow;
}
