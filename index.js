
module.exports = (app) => {
  const { encodeContent, decodeContent } = require('./lib/base46')
  
  // Your code here
  app.log('Yay! The app was loaded!')

  // Probot responds to a new pull request being opened
  app.on('pull_request.opened', async context => {
    // Retrieves the files changed by this pull request
    const files = await context.github.pullRequests.getFiles(context.issue())
    // Retrieves the data for the merge conflict from the config file
    const config = await context.config('config.yml')
    // Ensure that the targeted file is changed in the pull request
    const targetedFile = files.data.find(function(file) {
      // Return the file specified in the config.yml
      if(config.conflictTargetFile) {
        return file.filename.startsWith(config.conflictTargetFile)
      }
    })
    
    // Retrieve the contents of the targeted file
    const fileContent = await context.github.repos.getContent(context.repo({ path: targetedFile.filename }))
    
    // Commit the conflicting text to the same file, but on the master branch
    await context.github.repos.updateFile(context.repo({
      path: targetedFile.filename,
      message: 'Gee I hope this doesnt cause any conflict...',
      content: encodeContent(config.mergeConflictData),
      sha: fileContent.data.sha,
      branch: 'master'
    }))

    return
  })
}
