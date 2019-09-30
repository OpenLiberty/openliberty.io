Gem::Specification.new do |s|
  s.name               = 'ol-target-blank'
  s.version            = '0.0.1'
  s.date               = '2019-09-24'
  s.summary            = 'OpenLiberty Asciidoc extensions'
  s.description        = 'A set of extensions to Asciidoc for OpenLiberty project'
  s.authors            = ["Steven Zvonek"]
  s.email              = 'szvonek@us.ibm.com'
  s.files              = ["lib/ol-target-blank.rb"]
  s.homepage           = 'https://github.com/OpenLiberty/openliberty.io'
  s.license = "MIT"
  s.files = `git ls-files -z`.split("\x0")
  s.require_paths = ["lib"]
  s.required_ruby_version = ">= 2.3.0"

  s.add_dependency "jekyll", ">= 3.0", "<5.0"
  s.add_dependency "nokogiri", "~> 1.10"

  s.add_development_dependency "bundler", "~> 2.0"
  s.add_development_dependency "rake", "~> 12.0"
  s.add_development_dependency "rs", "~> 3.0"
  s.add_development_dependency "rubocop", "0.55" 
end
