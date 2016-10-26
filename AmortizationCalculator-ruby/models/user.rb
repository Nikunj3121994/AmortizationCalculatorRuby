require 'mongo_mapper'

class MonthYear
	include MongoMapper::EmbeddedDocument
	key :month, Integer
	key	:year, Integer
end

class UserCalculation
	include MongoMapper::Document
  	key :email,	String
  	key :loanAmount,	Float
  	key	:rateOfInterest,	Float
  	key	:tenure,	Float
  	one	:initialPaymentDate, :class => MonthYear
  	one :annualPayment
  	one	:monthlyPayment
  	one	:oneTimePayment
  	timestamps!
end



class AnnualPayment
	include MongoMapper::EmbeddedDocument
	one :startingDate,	:class => MonthYear
	key	:amount,	Float
	key	:noOfPayments, Integer
	embedded_in	:userCalculation
end

class MonthlyPayment
	include MongoMapper::EmbeddedDocument
	one :startingDate,	:class => MonthYear
	key	:amount,	Float
	one	:endingDate, :class => MonthYear
	embedded_in	:userCalculation
end

class OneTimePayment
	include MongoMapper::EmbeddedDocument
	one :paymentDate,	:class => MonthYear
	key	:amount,	Float
	embedded_in	:userCalculation
end



