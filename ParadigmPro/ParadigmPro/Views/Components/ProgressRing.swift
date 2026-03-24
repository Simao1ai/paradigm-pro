import SwiftUI

struct ProgressRing: View {
    let progress: Double // 0.0 to 1.0
    var lineWidth: CGFloat = 6
    var size: CGFloat = 44

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.ppSurfaceLight, lineWidth: lineWidth)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(
                    AngularGradient(
                        colors: [.ppIndigo, .ppOrange, .ppPink],
                        center: .center,
                        startAngle: .degrees(-90),
                        endAngle: .degrees(270)
                    ),
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.5), value: progress)

            Text("\(Int(progress * 100))%")
                .font(.system(size: size * 0.22, weight: .bold, design: .rounded))
                .foregroundStyle(PPGradient.gold)
        }
        .frame(width: size, height: size)
    }
}
