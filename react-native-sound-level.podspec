require 'json'
package = JSON.parse(File.read(File.join(__dir__,'package.json')))

Pod::Spec.new do |s|
  s.name            = 'react-native-sound-level'
  s.dependency        "React"

  s.version         = package["version"]
  s.license         = package["license"]
  s.summary         = package["description"]
  s.authors         = package["author"]
  s.homepage        = package["homepage"]

  s.platform        = :ios, "9.0"
  s.requires_arc    = true

  s.source          = { :git => s.homepage, :tag => s.version }
  s.source_files    = "ios/*.{h,m}"
end
