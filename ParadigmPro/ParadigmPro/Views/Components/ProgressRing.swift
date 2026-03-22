import SwiftUI

struct ProgressRing: View {
    let progress: Double // 0.0 to 1.0
    var lineWidth: CGFloat = 6
    var size: CGFloat = 44

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.brand100, lineWidth: lineWidth)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(
                    Color.brand600,
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.3), value: progress)

            Text("\(Int(progress * 100))%")
                .font(.system(size: size * 0.25, weight: .bold, design: .rounded))
                .foregroundColor(.brand600)
        }
        .frame(width: size, height: size)
    }
}
