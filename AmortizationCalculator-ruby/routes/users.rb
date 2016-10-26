# encoding: utf-8
require './models/user.rb'

def createUser(body)
	user_calculation = UserCalculation.create({
  		:email => body['email'],
  		:loanAmount => body['loanAmount'],
  		:rateOfInterest => body['rateOfInterest'],
  		:tenure => body['tenure'],
  		:initialPaymentDate => MonthYear.new(
  				:month => body['initialPaymentDate']['month'],
  				:year => body['initialPaymentDate']['year']
  			),
  		:annualPayment => body['annualPayment']==nil ? nil : AnnualPayment.new(
  				:startingDate => MonthYear.new(
	  				:month => body['annualPayment']['startingDate']['month'],
	  				:year => body['annualPayment']['startingDate']['year']
  				),
  				:amount =>body['annualPayment']['amount'],
  				:noOfPayments=>body['annualPayment']['noOfPayments']
  			),
  		:monthlyPayment => body['monthlyPayment']==nil ? nil : MonthlyPayment.new(
  				:startingDate => MonthYear.new(
	  				:month => body['monthlyPayment']['startingDate']['month'],
	  				:year => body['monthlyPayment']['startingDate']['year']
  				),
  				:amount =>body['monthlyPayment']['amount'],

  				:endingDate => MonthYear.new(
	  				:month => body['monthlyPayment']['endingDate']['month'],
	  				:year => body['monthlyPayment']['endingDate']['year']
  				)
  			),
  		:oneTimePayment => body['oneTimePayment']==nil ? nil : OneTimePayment.new(
				:paymentDate => MonthYear.new(
  					:month => body['oneTimePayment']['paymentDate']['month'],
  					:year => body['oneTimePayment']['paymentDate']['year']
				),
				:amount =>body['oneTimePayment']['amount']
			)
  		}
  	)
	user_calculation.save
	user_calculation.to_json
end


post '/api/user-calculations' do
  body = JSON.parse request.body.read
  puts body
  status 201
  content_type :json
  createUser(body)
end