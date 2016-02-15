## Deployment

* Dependencies

  * brew install homebrew/science/vips (required for npm module 'sharp' for image resizing)

* Environmental Variables (if change desired)

  * api-server -> {
    process.env.ENV: prod, dev, etc.
    process.env.PORT
  }
  
  * msg-queue -> {
    process.env.MQ_PORT
  }