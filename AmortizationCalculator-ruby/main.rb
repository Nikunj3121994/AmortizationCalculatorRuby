require 'json'
require 'sinatra'
require 'mongo_mapper'
require 'rack/cors'

configure do
  	MongoMapper.connection = Mongo::Connection.new('localhost',27017)
	MongoMapper.database = 'amortization'
end

use Rack::Cors do
  allow do
    origins '*'
    resource '*', headers: :any, methods: :any
  end  
end

require './models/user'
require './routes/users'