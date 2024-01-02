Gem::Specification.new do |s|
  s.name               = 'ol-target-blank'
  s.version            = '0.0.1'
  s.date               = '2019-09-24'
  s.summary            = 'OpenLiberty External Link processing'
  s.description        = 'OpenLiberty Target Blank automatically modifies external links to open in a new browser for the OpenLiberty project and adds a notranslate class to localhost links.'
  s.authors            = ["Steven Zvonek"]
  s.email              = 'szvonek@us.ibm.com'
  s.files              = ["lib/ol-target-blank.rb"]
  s.homepage           = 'https://github.com/OpenLiberty/openliberty.io'
  s.license = "MIT"
  s.require_paths = ["lib"]
  s.required_ruby_version = ">= 2.3.0"

  s.add_dependency "jekyll", ">= 3.0", "<5.0"
  s.add_dependency "nokogiri", "~> 1.10"

  s.add_development_dependency "bundler", "~> 2.0"
  s.add_development_dependency "rake", "~> 12.0"
  s.add_development_dependency "rs", "~> 3.0"
  s.add_development_dependency "rubocop", "0.55" 
end
