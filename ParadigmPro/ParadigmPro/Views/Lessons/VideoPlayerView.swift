import SwiftUI
import AVKit

struct VideoPlayerView: View {
    let url: String
    let resumeFrom: Int
    let onProgressUpdate: (Int) -> Void

    @State private var player: AVPlayer?
    @State private var autoSaveTimer: Timer?

    var body: some View {
        Group {
            if let player {
                VideoPlayer(player: player)
            } else {
                Rectangle()
                    .fill(Color.black)
                    .overlay(
                        ProgressView()
                            .tint(.white)
                    )
            }
        }
        .onAppear { setupPlayer() }
        .onDisappear { cleanup() }
    }

    private func setupPlayer() {
        guard let videoURL = URL(string: url) else { return }

        let avPlayer = AVPlayer(url: videoURL)
        self.player = avPlayer

        // Resume from last position
        if resumeFrom > 0 {
            let time = CMTime(seconds: Double(resumeFrom), preferredTimescale: 1)
            avPlayer.seek(to: time)
        }

        avPlayer.play()

        // Auto-save progress every 5 seconds
        autoSaveTimer = Timer.scheduledTimer(withTimeInterval: Constants.videoAutoSaveInterval, repeats: true) { _ in
            guard let currentTime = self.player?.currentTime() else { return }
            let seconds = Int(CMTimeGetSeconds(currentTime))
            if seconds > 0 {
                onProgressUpdate(seconds)
            }
        }
    }

    private func cleanup() {
        autoSaveTimer?.invalidate()
        autoSaveTimer = nil

        // Save final position
        if let currentTime = player?.currentTime() {
            let seconds = Int(CMTimeGetSeconds(currentTime))
            if seconds > 0 {
                onProgressUpdate(seconds)
            }
        }

        player?.pause()
        player = nil
    }
}
