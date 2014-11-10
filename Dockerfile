FROM ruby
RUN gem install jekyll
RUN gem install therubyracer
WORKDIR /data
COPY . /data
CMD ["jekyll", "serve"]
