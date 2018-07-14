#include <memory>

#include "bridge.h"
#include "rnsldesktop.h"
#include <math.h>
#include <QCryptographicHash>
#include <QDateTime>
#include <QDebug>
#include <QLocale>
#include <QMap>
#include <QString>
#include <QNetworkDiskCache>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QQuickImageProvider>
#include <QtMultimedia/QAudioFormat>
#include <QtMultimedia/QAudioInput>
#include <QtMultimedia/QAudioDeviceInfo>

namespace {
struct RegisterQMLMetaType {
    RegisterQMLMetaType() {
        qRegisterMetaType<RNSoundLevel*>();
    }
} registerMetaType;
} // namespace

class RNSoundLevelPrivate {

public:
    RNSoundLevelPrivate() {}

    Bridge* bridge = nullptr;

    QVariantList languages() {
        QStringList languages = QLocale().uiLanguages();
        QVariantList variantLanguages;
        for (QString l : languages) {
            variantLanguages.push_back(l);
        }
        return variantLanguages;
    }
};

RNSoundLevel::RNSoundLevel(QObject* parent) : QObject(parent), d_ptr(new RNSoundLevelPrivate) {}

RNSoundLevel::~RNSoundLevel() {}

void RNSoundLevel::start() {
    m_device = QAudioDeviceInfo::defaultInputDevice();

    m_format.setSampleRate(22050);
    m_format.setChannelCount(1);
    m_format.setSampleSize(16);
    m_format.setSampleType(QAudioFormat::SignedInt);
    m_format.setByteOrder(QAudioFormat::LittleEndian);
    m_format.setCodec("audio/pcm");

    QAudioDeviceInfo info(m_device);
    if (!info.isFormatSupported(m_format)) {
        m_format = info.nearestFormat(m_format);
    }

    if (m_audioInfo)
        delete m_audioInfo;

    frameId = 0;
    m_audioInfo  = new AudioInfo(m_format, this);

    // uncomment to use with events
    // connect(m_audioInfo, SIGNAL(update()), SLOT(updated()));

    m_audioInput = new QAudioInput(m_device, m_format, this);
    qreal initialVolume = QAudio::convertVolume(m_audioInput->volume(),
                                                QAudio::LinearVolumeScale,
                                                QAudio::LogarithmicVolumeScale);
    m_audioInfo->start();
    m_audioInput->start(m_audioInfo);
}

void RNSoundLevel::stop() {
    m_audioInfo->stop();
    m_audioInput->stop();
    m_audioInput->disconnect(this);
    delete m_audioInput;
}

void RNSoundLevel::measure(double successCallback, double errorCallback) {
    Q_D(RNSoundLevel);

    qreal value = (m_audioInfo->level() - 1) * 160;

    QString json = "{\"rawValue\":" + QString::number(m_audioInfo->level()) + ", \"value\":" + QString::number(value) + ", \"id\":" + QString::number(frameId++) + "}";

    d->bridge->invokePromiseCallback(successCallback, QVariantList{json});
}

// keep this for the time events are supported by RN Desktop
void RNSoundLevel::updated()
{
    // qWarning() << "Raw level = " << m_audioInfo->level();
}

QString RNSoundLevel::moduleName() {
    return "RNSoundLevel";
}

QList<ModuleMethod*> RNSoundLevel::methodsToExport() {
    return QList<ModuleMethod*>{};
}

QVariantMap RNSoundLevel::constantsToExport() {
    return QVariantMap();
}

void RNSoundLevel::setBridge(Bridge* bridge) {
    Q_D(RNSoundLevel);
    d->bridge = bridge;
}
